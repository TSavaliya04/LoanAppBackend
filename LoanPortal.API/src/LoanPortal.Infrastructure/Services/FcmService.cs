using FirebaseAdmin.Messaging;
using LoanPortal.Core.Interfaces;

namespace LoanPortal.Infrastructure.Services
{
    /// <summary>
    /// Sends Web Push notifications via FCM using the already-initialised FirebaseAdmin SDK.
    /// Uses WebpushConfig so the Next.js PWA service worker can display them even when the app is in background.
    /// </summary>
    public class FcmService : IFcmService
    {
        private const int FcmMaxBatchSize = 500; // FCM per-request limit

        public async Task SendAsync(string? fcmToken, string title, string body, Dictionary<string, string>? data = null)
        {
            if (string.IsNullOrWhiteSpace(fcmToken)) return;

            try
            {
                var message = BuildMessage(fcmToken, title, body, data);
                await FirebaseMessaging.DefaultInstance.SendAsync(message);
            }
            catch (Exception ex)
            {
                // Log but never propagate — invalid/expired tokens are expected
                Console.WriteLine($"[FcmService] SendAsync failed for token {fcmToken[..10]}...: {ex.Message}");
            }
        }

        public async Task SendMulticastAsync(
            IEnumerable<string> fcmTokens,
            string title,
            string body,
            Dictionary<string, string>? data = null)
        {
            var tokens = fcmTokens
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct()
                .ToList();

            if (!tokens.Any()) return;

            // Chunk into batches of ≤500 per FCM limits
            var batches = tokens
                .Select((token, idx) => new { token, idx })
                .GroupBy(x => x.idx / FcmMaxBatchSize)
                .Select(g => g.Select(x => x.token).ToList());

            var tasks = batches.Select(async batch =>
            {
                try
                {
                    var multicastMessage = new MulticastMessage
                    {
                        Tokens       = batch,
                        Notification = new Notification { Title = title, Body = body },
                        Data         = data ?? new Dictionary<string, string>(),
                        Webpush      = new WebpushConfig
                        {
                            Notification = new WebpushNotification
                            {
                                Title = title,
                                Body  = body,
                                Icon  = "/icon.png"   // Update to match your PWA icon path
                            },
                            FcmOptions = new WebpushFcmOptions
                            {
                                // Deep-link to the relevant quote if quoteId is in data
                                Link = data != null && data.TryGetValue("quoteId", out var qid)
                                    ? $"/quotes/{qid}"
                                    : "/"
                            }
                        }
                    };

                    var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(multicastMessage);

                    if (response.FailureCount > 0)
                    {
                        Console.WriteLine($"[FcmService] {response.FailureCount}/{batch.Count} FCM sends failed in batch.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[FcmService] SendMulticastAsync batch failed: {ex.Message}");
                }
            });

            await Task.WhenAll(tasks);
        }

        private static Message BuildMessage(string token, string title, string body, Dictionary<string, string>? data)
        {
            return new Message
            {
                Token        = token,
                Notification = new Notification { Title = title, Body = body },
                Data         = data ?? new Dictionary<string, string>(),
                Webpush      = new WebpushConfig
                {
                    Notification = new WebpushNotification
                    {
                        Title = title,
                        Body  = body,
                        Icon  = "/icon.png"
                    }
                }
            };
        }
    }
}

