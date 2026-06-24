import Foundation
import Capacitor
import FoundationModels

@available(iOS 26.0, *)
@Generable
struct ExamScanData {
    @Guide(description: "Das Schulfach der Prüfung, exakt wie auf dem Blatt")
    var subjectName: String?

    @Guide(description: "Datum der Prüfung im Format yyyy-MM-dd")
    var date: String?

    @Guide(description: "Titel bzw. Name der Prüfung")
    var examName: String?

    @Guide(description: "Note als Zahl von 1 bis 6, exakt wie auf dem Blatt")
    var score: Double?

    @Guide(description: "Erreichte Punkte")
    var pointsAchieved: Double?

    @Guide(description: "Maximal mögliche Punkte")
    var pointsMax: Double?
}

/// Capacitor plugin that exposes Apple's on-device Foundation Models to JS.
@objc(FoundationModelsPlugin)
public class FoundationModelsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FoundationModelsPlugin"
    public let jsName = "FoundationModels"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "generateExamData", returnType: CAPPluginReturnPromise)
    ]
    @objc func generateExamData(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else {
            call.reject("prompt is required")
            return
        }

        guard #available(iOS 26.0, *) else {
            call.reject("Foundation Models requires iOS 26 or later")
            return
        }

        let model = SystemLanguageModel.default
        switch model.availability {
        case .available:
            Task {
                do {
                    let instructions = """
                    Du analysierst eine gescannte Schulprüfung. Lies alle Werte \
                    DIREKT aus dem Text – erfinde oder berechne nichts. Lass \
                    Felder weg, die du nicht sicher erkennst.
                    """
                    let session = LanguageModelSession(instructions: instructions)
                    let response = try await session.respond(
                        to: prompt,
                        generating: ExamScanData.self
                    )
                    let d = response.content

                    var result: [String: Any] = [:]
                    if let v = d.subjectName { result["subjectName"] = v }
                    if let v = d.date { result["date"] = v }
                    if let v = d.examName { result["examName"] = v }
                    if let v = d.score { result["score"] = v }
                    if let v = d.pointsAchieved { result["pointsAchieved"] = v }
                    if let v = d.pointsMax { result["pointsMax"] = v }
                    call.resolve(result)
                } catch {
                    call.reject(error.localizedDescription)
                }
            }
        case .unavailable(.deviceNotEligible):
            call.reject("Device not eligible for Apple Intelligence")
        case .unavailable(.appleIntelligenceNotEnabled):
            call.reject("Apple Intelligence is not enabled")
        case .unavailable(.modelNotReady):
            call.reject("Model not ready (downloading or unavailable)")
        case .unavailable(let other):
            call.reject("Model unavailable: \(other)")
        }
    }
}
