namespace LoanPortal.Core.Interfaces
{
    /// <summary>
    /// Sends FCM Web Push notifications to the Next.js PWA.
    /// Uses FirebaseMessaging from the already-initialised FirebaseAdmin SDK.
    /// All methods silently no-op on null/empty tokens — callers don't need to guard.
    /// </summary>
    public interface IFcmService
    {
        /// <summary>Send a push notification to a single FCM token.</summary>
        Task SendAsync(string? fcmToken, string title, string body, Dictionary<string, string>? data = null);

        /// <summary>
        /// Send the same notification to multiple FCM tokens in parallel.
        /// Internally batches into chunks of ≤500 per FCM limits.
        /// </summary>
        Task SendMulticastAsync(IEnumerable<string> fcmTokens, string title, string body, Dictionary<string, string>? data = null);
    }
}

