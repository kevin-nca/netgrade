import Capacitor

/// Custom bridge view controller used to register app-local plugins that are
/// not part of an npm package (Capacitor only auto-registers package plugins).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(FoundationModelsPlugin())
    }
}
