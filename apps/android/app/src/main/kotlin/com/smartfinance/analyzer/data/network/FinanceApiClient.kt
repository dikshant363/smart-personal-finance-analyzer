package com.smartfinance.analyzer.data.network

import com.smartfinance.analyzer.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Retrofit API Client — consumes the shared Smart Finance REST API.
 * Sprint 11.3: All endpoints are identical to those used by the web platform.
 *
 * Architecture: Never duplicates business logic. All financial calculations
 * happen on the backend. This client is a thin transport layer.
 */
@Singleton
class FinanceApiClient @Inject constructor(
    private val tokenRepository: TokenRepository
) {
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG)
            HttpLoggingInterceptor.Level.BODY
        else
            HttpLoggingInterceptor.Level.NONE
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val token = tokenRepository.getAccessToken()
            val request = if (token != null) {
                chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $token")
                    .addHeader("X-Platform", "android")
                    .addHeader("X-App-Version", BuildConfig.VERSION_NAME)
                    .build()
            } else {
                chain.request()
            }
            chain.proceed(request)
        }
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    inline fun <reified T> create(): T = retrofit.create(T::class.java)
}
