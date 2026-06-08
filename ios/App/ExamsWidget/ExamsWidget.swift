import WidgetKit
import SwiftUI

private let appGroupId = "group.com.netgrade.app"
private let storageKey = "next_exams"

struct WidgetExamEntry: Decodable, Identifiable {
    let id: String
    let name: String
    let subjectName: String
    let date: String

    var parsedDate: Date? {
        ISO8601DateFormatter().date(from: date)
    }
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
        // Refresh once an hour as a safety net; the app also triggers reloads on changes.
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
        return (try? JSONDecoder().decode([WidgetExamEntry].self, from: data)) ?? []
    }

    private var sampleExams: [WidgetExamEntry] {
        [
            WidgetExamEntry(id: "1", name: "Algebra", subjectName: "Mathe", date: "2026-05-22T00:00:00Z"),
            WidgetExamEntry(id: "2", name: "Aufsatz", subjectName: "Deutsch", date: "2026-05-24T00:00:00Z"),
            WidgetExamEntry(id: "3", name: "Vocab", subjectName: "Englisch", date: "2026-05-27T00:00:00Z"),
        ]
    }
}

struct NextExamsWidgetView: View {
    let entry: ExamsTimelineEntry

    private static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "de_DE")
        f.dateFormat = "EE d.M."
        return f
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Nächste Prüfungen")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            if entry.exams.isEmpty {
                Spacer()
                Text("Keine anstehenden Prüfungen")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                Spacer()
            } else {
                ForEach(entry.exams.prefix(3)) { exam in
                    HStack {
                        Text(exam.subjectName.isEmpty ? exam.name : exam.subjectName)
                            .font(.callout.weight(.medium))
                            .lineLimit(1)
                        Spacer()
                        Text(formattedDate(exam.parsedDate))
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer(minLength: 0)
            }
        }
        .padding()
    }

    private func formattedDate(_ date: Date?) -> String {
        guard let date else { return "—" }
        return Self.dayFormatter.string(from: date)
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
        .description("Zeigt deine nächsten 3 anstehenden Prüfungen aus NetGrade.")
        .supportedFamilies([.systemMedium])
    }
}

@main
struct NextExamsWidgetBundle: WidgetBundle {
    var body: some Widget {
        NextExamsWidget()
    }
}
