import WidgetKit
import SwiftUI

private let appGroupId = "group.com.netgrade.app"
private let storageKey = "next_exams"

struct WidgetExamEntry: Decodable, Identifiable {
    let id: String
    let name: String
    let subjectName: String
    let date: Date
}

struct ExamsTimelineEntry: TimelineEntry {
    let date: Date
    let exams: [WidgetExamEntry]
}

struct ExamsProvider: TimelineProvider {
    func placeholder(in context: Context) -> ExamsTimelineEntry {
        ExamsTimelineEntry(date: Date(), exams: sampleExams)
    }

    func getSnapshot(in context: Context, completion: @escaping (ExamsTimelineEntry) -> Void) {
        completion(ExamsTimelineEntry(date: Date(), exams: loadExams()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ExamsTimelineEntry>) -> Void) {
        let entry = ExamsTimelineEntry(date: Date(), exams: loadExams())
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func loadExams() -> [WidgetExamEntry] {
        guard
            let defaults = UserDefaults(suiteName: appGroupId),
            let raw = defaults.string(forKey: storageKey),
            let data = raw.data(using: .utf8)
        else {
            return []
        }

        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX"
        formatter.timeZone = TimeZone(secondsFromGMT: 0)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(formatter)
        return (try? decoder.decode([WidgetExamEntry].self, from: data)) ?? []
    }

    private var sampleExams: [WidgetExamEntry] {
        [
            WidgetExamEntry(id: "1", name: "Brüche", subjectName: "Mathematik",
                            date: Calendar.current.date(byAdding: .day, value: 2, to: Date()) ?? Date()),
            WidgetExamEntry(id: "2", name: "Lektüre", subjectName: "Deutsch",
                            date: Calendar.current.date(byAdding: .day, value: 6, to: Date()) ?? Date()),
        ]
    }
}

private let avatarPalette: [Color] = [
    Color(red: 0.13, green: 0.45, blue: 0.96),
    Color(red: 0.55, green: 0.36, blue: 0.96),
    Color(red: 0.96, green: 0.38, blue: 0.43),
    Color(red: 0.96, green: 0.60, blue: 0.20),
    Color(red: 0.18, green: 0.70, blue: 0.55),
    Color(red: 0.86, green: 0.32, blue: 0.66),
    Color(red: 0.32, green: 0.62, blue: 0.86),
]

private func colorForSubject(_ name: String) -> Color {
    guard !name.isEmpty else { return avatarPalette[0] }
    var hash = 5381
    for ch in name.unicodeScalars {
        hash = ((hash << 5) &+ hash) &+ Int(ch.value)
    }
    return avatarPalette[abs(hash) % avatarPalette.count]
}

private func initialLetter(_ name: String) -> String {
    String(name.trimmingCharacters(in: .whitespaces).prefix(1)).uppercased()
}

struct SubjectAvatar: View {
    let text: String
    let color: Color
    var size: CGFloat = 32

    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.28, style: .continuous)
            .fill(color)
            .frame(width: size, height: size)
            .overlay(
                Text(text)
                    .font(.system(size: size * 0.5, weight: .bold))
                    .foregroundStyle(.white)
            )
    }
}

struct NextExamsWidgetView: View {
    let entry: ExamsTimelineEntry

    private static let dayMonthFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "de_DE")
        f.dateFormat = "d. MMMM"
        return f
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            header

            if entry.exams.isEmpty {
                Spacer()
                Text("Keine anstehenden Prüfungen")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                Spacer()
            } else {
                ForEach(Array(entry.exams.prefix(3).enumerated()), id: \.element.id) { index, exam in
                    if index > 0 {
                        Divider()
                    }
                    examRow(exam)
                }
                Spacer(minLength: 0)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
    }

    private var header: some View {
        HStack {
            Text("Prüfungen")
                .font(.subheadline.weight(.semibold))
            Spacer()
            Text("\(entry.exams.count) anstehend")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private func examRow(_ exam: WidgetExamEntry) -> some View {
        HStack(alignment: .center, spacing: 8) {
            SubjectAvatar(
                text: initialLetter(exam.subjectName.isEmpty ? exam.name : exam.subjectName),
                color: colorForSubject(exam.subjectName.isEmpty ? exam.name : exam.subjectName),
                size: 26
            )

            VStack(alignment: .leading, spacing: 0) {
                Text(exam.name.isEmpty ? exam.subjectName : exam.name)
                    .font(.footnote.weight(.semibold))
                    .lineLimit(1)
                if !exam.subjectName.isEmpty && !exam.name.isEmpty {
                    Text(exam.subjectName)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 0) {
                Text(relativeText(for: exam.date))
                    .font(.caption2.weight(.semibold))
                HStack(spacing: 3) {
                    Image(systemName: "clock")
                        .font(.system(size: 9))
                    Text(absoluteText(for: exam.date))
                        .font(.system(size: 10))
                }
                .foregroundStyle(.secondary)
            }
        }
    }

    private func absoluteText(for date: Date) -> String {
        Self.dayMonthFormatter.string(from: date)
    }

    private func relativeText(for date: Date) -> String {
        let cal = Calendar.current
        let start = cal.startOfDay(for: Date())
        let target = cal.startOfDay(for: date)
        let days = cal.dateComponents([.day], from: start, to: target).day ?? 0
        switch days {
        case ..<0: return "vorbei"
        case 0:    return "heute"
        case 1:    return "morgen"
        default:   return "in \(days) Tagen"
        }
    }
}

struct NextExamsWidget: Widget {
    let kind: String = "ExamsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ExamsProvider()) { entry in
            if #available(iOS 17.0, *) {
                NextExamsWidgetView(entry: entry).containerBackground(.background, for: .widget)
            } else {
                NextExamsWidgetView(entry: entry).background(Color(.systemBackground))
            }
        }
        .configurationDisplayName("Nächste Prüfungen")
        .description("Zeigt deine nächsten anstehenden Prüfungen aus NetGrade.")
        .supportedFamilies([.systemMedium])
    }
}

@main
struct NextExamsWidgetBundle: WidgetBundle {
    var body: some Widget {
        NextExamsWidget()
    }
}
