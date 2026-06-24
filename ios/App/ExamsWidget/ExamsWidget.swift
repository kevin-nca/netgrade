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

struct WidgetPayload: Decodable {
    let exams: [WidgetExamEntry]
    let totalCount: Int
}

struct ExamsTimelineEntry: TimelineEntry {
    let date: Date
    let exams: [WidgetExamEntry]
    let totalCount: Int
}

private let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
}()

struct ExamsProvider: TimelineProvider {
    func placeholder(in context: Context) -> ExamsTimelineEntry {
        ExamsTimelineEntry(date: Date(), exams: sampleExams, totalCount: sampleExams.count)
    }

    func getSnapshot(in context: Context, completion: @escaping (ExamsTimelineEntry) -> Void) {
        let payload = loadPayload()
        completion(ExamsTimelineEntry(date: Date(), exams: payload.exams, totalCount: payload.totalCount))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ExamsTimelineEntry>) -> Void) {
        let payload = loadPayload()
        let entry = ExamsTimelineEntry(date: Date(), exams: payload.exams, totalCount: payload.totalCount)
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func loadPayload() -> WidgetPayload {
        guard
            let defaults = UserDefaults(suiteName: appGroupId),
            let raw = defaults.string(forKey: storageKey),
            let data = raw.data(using: .utf8)
        else { return WidgetPayload(exams: [], totalCount: 0) }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let s = try decoder.singleValueContainer().decode(String.self)
            return isoFormatter.date(from: s) ?? Date()
        }
        return (try? decoder.decode(WidgetPayload.self, from: data)) ?? WidgetPayload(exams: [], totalCount: 0)
    }

    private var sampleExams: [WidgetExamEntry] {
        let now = Date()
        let day: (Int) -> Date = { Calendar.current.date(byAdding: .day, value: $0, to: now) ?? now }
        return [
            WidgetExamEntry(id: "1", name: "Brüche", subjectName: "Mathematik", date: day(2)),
            WidgetExamEntry(id: "2", name: "Lektüre", subjectName: "Deutsch", date: day(6)),
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
    let hash = name.unicodeScalars.reduce(5381) { ($0 &* 33) &+ Int($1.value) }
    return avatarPalette[abs(hash) % avatarPalette.count]
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

    private static let dateFormat: Date.FormatStyle =
        .dateTime.day().month(.wide).locale(Locale(identifier: "de_DE"))

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
                let shown = Array(entry.exams.prefix(3))
                ForEach(shown.indices, id: \.self) { idx in
                    if idx > 0 { Divider() }
                    examRow(shown[idx])
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
            Text("\(entry.totalCount) anstehend")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private func examRow(_ exam: WidgetExamEntry) -> some View {
        let primary = exam.subjectName.isEmpty ? exam.name : exam.subjectName
        let initial = String(primary.prefix(1)).uppercased()

        return HStack(alignment: .center, spacing: 8) {
            SubjectAvatar(text: initial, color: colorForSubject(primary), size: 26)

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
                    Text(exam.date, format: Self.dateFormat)
                        .font(.system(size: 10))
                }
                .foregroundStyle(.secondary)
            }
        }
    }

    private func relativeText(for date: Date) -> String {
        let cal = Calendar.current
        let days = cal.dateComponents([.day], from: cal.startOfDay(for: Date()), to: cal.startOfDay(for: date)).day ?? 0
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
