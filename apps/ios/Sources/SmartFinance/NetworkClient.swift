import Foundation

/**
 * Shared API Network Client for Apple Ecosystem Platforms
 * Sprint 11.4 — Communicates with the Next.js REST endpoints.
 * All computations reside on the backend server.
 */
public class NetworkClient: ObservableObject {
    public static val shared = NetworkClient()
    
    private let baseURL = URL(string: "https://your-finance-api.vercel.app")!
    private var accessToken: String? = nil

    private init() {}

    public func setAccessToken(_ token: String) {
        self.accessToken = token
    }

    public func fetchTransactions() async throws -> [TransactionDTO] {
        let url = baseURL.appendingPathComponent("api/transactions")
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("ios", forHTTPHeaderField: "X-Platform")
        request.setValue("1.0.0", forHTTPHeaderField: "X-App-Version")

        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }

        // Handles paginated wrapping structure
        struct ResponseEnvelope: Codable {
            let ok: Boolean
            let data: [TransactionDTO]
        }
        
        let decoder = JSONDecoder()
        let result = try decoder.decode(ResponseEnvelope.self, from: data)
        return result.data
    }
}
