package com.smartfinance.analyzer.data.network

import com.smartfinance.analyzer.domain.model.Transaction
import com.smartfinance.analyzer.domain.model.Budget
import com.smartfinance.analyzer.domain.model.Goal
import com.smartfinance.analyzer.domain.model.AuthResponse
import retrofit2.Response
import retrofit2.http.*

/**
 * Finance API Service Interface — mirrors the shared REST API contract.
 * Sprint 11.3: All paths match the Next.js backend routes exactly.
 */
interface FinanceApiService {

    // ── Authentication ──────────────────────────────────────────────────────
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/auth/refresh")
    suspend fun refreshToken(@Body body: RefreshRequest): Response<AuthResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Unit>

    // ── Transactions ────────────────────────────────────────────────────────
    @GET("api/transactions")
    suspend fun getTransactions(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): Response<PagedResponse<Transaction>>

    @POST("api/transactions")
    suspend fun createTransaction(@Body body: CreateTransactionRequest): Response<Transaction>

    @PUT("api/transactions/{id}")
    suspend fun updateTransaction(
        @Path("id") id: String,
        @Body body: UpdateTransactionRequest
    ): Response<Transaction>

    @DELETE("api/transactions/{id}")
    suspend fun deleteTransaction(@Path("id") id: String): Response<Unit>

    // ── Budgets ─────────────────────────────────────────────────────────────
    @GET("api/budgets")
    suspend fun getBudgets(): Response<List<Budget>>

    @POST("api/budgets")
    suspend fun createBudget(@Body body: CreateBudgetRequest): Response<Budget>

    // ── Goals ───────────────────────────────────────────────────────────────
    @GET("api/goals")
    suspend fun getGoals(): Response<List<Goal>>

    @POST("api/goals")
    suspend fun createGoal(@Body body: CreateGoalRequest): Response<Goal>

    // ── AI Copilot ──────────────────────────────────────────────────────────
    @POST("api/copilot/chat")
    suspend fun sendCopilotMessage(@Body body: CopilotChatRequest): Response<CopilotChatResponse>

    @GET("api/copilot/conversations")
    suspend fun getConversations(): Response<List<ConversationSummary>>
}

// ── Request/Response DTOs ───────────────────────────────────────────────────
data class LoginRequest(val email: String, val password: String)
data class RefreshRequest(val refreshToken: String)
data class CreateTransactionRequest(
    val amount: Double,
    val currency: String,
    val type: String,
    val description: String,
    val date: String,
    val categoryId: String?
)
data class UpdateTransactionRequest(
    val amount: Double?,
    val description: String?,
    val date: String?,
    val categoryId: String?
)
data class CreateBudgetRequest(val name: String, val amount: Double, val period: String, val categoryId: String?)
data class CreateGoalRequest(val name: String, val targetAmount: Double, val deadline: String?, val category: String)
data class CopilotChatRequest(val message: String, val conversationId: String?)
data class CopilotChatResponse(val reply: String, val conversationId: String)
data class ConversationSummary(val id: String, val title: String, val updatedAt: String)
data class PagedResponse<T>(val ok: Boolean, val data: List<T>, val pagination: Pagination)
data class Pagination(val total: Int, val page: Int, val limit: Int, val hasMore: Boolean)
