using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Azure.Storage.Blobs;

namespace AllHeads.ImageProcessor
{
    public class BlobTrigger
    {
        private readonly ILogger<BlobTrigger> _logger;

        public BlobTrigger(ILogger<BlobTrigger> logger)
        {
            _logger = logger;
        }

        [Function(nameof(BlobTrigger))]
        public async Task Run([BlobTrigger("images/{name}", Connection = "allheadsimagestorage_STORAGE")] BlobClient blobClient, string name)
        {
            var response = blobClient.DownloadStreaming();
            if(response.Value.Details.Metadata.ContainsKey("image_tag"))
            {
                _logger.LogInformation($"Description for image {name} already set");
                return;
            }

            var imageKey = Environment.GetEnvironmentVariable("IMAGE_KEY");
            var imageEndpoint = Environment.GetEnvironmentVariable("IMAGE_ENDPOINT");

            ComputerVisionClient client = new(new ApiKeyServiceClientCredentials(imageKey)){ Endpoint = imageEndpoint };
            var description = await client.DescribeImageInStreamAsync(response.Value.Content);
            var caption = description.Captions.First().Text;
            Dictionary<string, string> metadata = new() {{"image_tag", caption}};
            await blobClient.SetMetadataAsync(metadata);

            _logger.LogInformation($"Image name: {name} description: {caption}");
        }
    }
}
