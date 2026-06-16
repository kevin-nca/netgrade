import Foundation
import Capacitor
import FoundationModels

/// Capacitor plugin that exposes Apple's on-device Foundation Models to JS.
/// Usage from TS: FoundationModels.generate({ prompt, instructions })
@objc(FoundationModelsPlugin)
public class FoundationModelsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FoundationModelsPlugin"
    public let jsName = "FoundationModels"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "generate", returnType: CAPPluginReturnPromise)
    ]

    @objc func generate(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else {
            call.reject("prompt is required")
            return
        }
        let instructions = call.getString("instructions")

        guard #available(iOS 26.0, *) else {
            call.reject("Foundation Models requires iOS 26 or later")
            return
        }

        // Create a reference to the system language model.
        let model = SystemLanguageModel.default

        switch model.availability {
        case .available:
            Task {
                do {
                    // Create a session, optionally with instructions.
                    let session: LanguageModelSession
                    if let instructions {
                        session = LanguageModelSession(instructions: instructions)
                    } else {
                        session = LanguageModelSession()
                    }

                    // Generate a response to the prompt.
                    let response = try await session.respond(to: prompt)
                    call.resolve(["text": response.content])
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
