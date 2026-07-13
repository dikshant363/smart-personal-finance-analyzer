package com.smartfinance.analyzer.data.local

import androidx.room.*
import com.smartfinance.analyzer.domain.model.Transaction

/**
 * Room Database — Offline cache for Smart Finance Analyzer Android
 * Sprint 11.3: Provides local persistence for offline-first behavior.
 * Data is synced with the shared backend via WorkManager background jobs.
 */
@Database(
    entities = [
        TransactionEntity::class,
        BudgetEntity::class,
        GoalEntity::class,
        SyncQueueEntity::class,
    ],
    version = 1,
    exportSchema = true
)
abstract class FinanceDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
    abstract fun budgetDao(): BudgetDao
    abstract fun goalDao(): GoalDao
    abstract fun syncQueueDao(): SyncQueueDao

    companion object {
        const val DATABASE_NAME = "finance_db"
    }
}

// ── Entities ────────────────────────────────────────────────────────────────

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val amount: Double,
    val currency: String,
    val type: String,
    val description: String,
    val date: String,
    val categoryId: String?,
    val categoryName: String?,
    val source: String,
    val createdAt: String,
    val updatedAt: String,
    val synced: Boolean = true,
)

@Entity(tableName = "budgets")
data class BudgetEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val name: String,
    val amount: Double,
    val spent: Double,
    val period: String,
    val categoryId: String?,
    val startDate: String,
    val synced: Boolean = true,
)

@Entity(tableName = "goals")
data class GoalEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val name: String,
    val targetAmount: Double,
    val currentAmount: Double,
    val deadline: String?,
    val category: String,
    val status: String,
    val synced: Boolean = true,
)

@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
    @PrimaryKey(autoGenerate = true) val queueId: Long = 0,
    val entity: String,       // "transaction" | "budget" | "goal"
    val action: String,       // "CREATE" | "UPDATE" | "DELETE"
    val payload: String,      // JSON blob
    val attempts: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
)

// ── DAOs ─────────────────────────────────────────────────────────────────────

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY date DESC LIMIT :limit OFFSET :offset")
    suspend fun getTransactions(limit: Int = 50, offset: Int = 0): List<TransactionEntity>

    @Query("SELECT * FROM transactions WHERE synced = 0")
    suspend fun getUnsyncedTransactions(): List<TransactionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(transactions: List<TransactionEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("UPDATE transactions SET synced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)
}

@Dao
interface BudgetDao {
    @Query("SELECT * FROM budgets ORDER BY name ASC")
    suspend fun getAll(): List<BudgetEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(budgets: List<BudgetEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(budget: BudgetEntity)
}

@Dao
interface GoalDao {
    @Query("SELECT * FROM goals ORDER BY createdAt DESC")
    suspend fun getAll(): List<GoalEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(goals: List<GoalEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(goal: GoalEntity)
}

@Dao
interface SyncQueueDao {
    @Query("SELECT * FROM sync_queue ORDER BY createdAt ASC")
    suspend fun getPending(): List<SyncQueueEntity>

    @Insert
    suspend fun enqueue(item: SyncQueueEntity): Long

    @Query("DELETE FROM sync_queue WHERE queueId = :id")
    suspend fun dequeue(id: Long)

    @Query("UPDATE sync_queue SET attempts = attempts + 1 WHERE queueId = :id")
    suspend fun incrementAttempts(id: Long)
}
