// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SmartFinance",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "SmartFinance", targets: ["SmartFinance"])
    ],
    dependencies: [
        // Keychain helper for secure credential storage
        .package(url: "https://github.com/evgenyneu/keychain-swift.git", from: "20.0.0")
    ],
    targets: [
        .target(
            name: "SmartFinance",
            dependencies: [
                .product(name: "KeychainSwift", package: "keychain-swift")
            ],
            path: "Sources"
        ),
        .testTarget(
            name: "SmartFinanceTests",
            dependencies: ["SmartFinance"],
            path: "Tests"
        )
    ]
)
