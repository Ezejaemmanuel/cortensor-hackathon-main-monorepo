$body = @{
    session_id = 72;
    prompt = 'Current date: Thursday, August 28, 2025\n\nBased on the following conversation context, generate a concise summary of this conversation in a single sentence:\n\nConversation context:\n1. User: "Hi there! How are you doing today?"\n2. AI: "I''m doing great, thank you for asking! How can I assist you?"\n3. User: "I''m looking for information on the latest advancements in AI. Can you tell me more?"\n4. AI: "Certainly! Recent advancements include large language models like GPT-4, generative AI for image creation, and significant progress in reinforcement learning."\n5. User: "That''s fascinating! What about the ethical implications of these advancements?"\n6. AI: "Ethical considerations are crucial. Discussions revolve around bias in data, job displacement, and the responsible development and deployment of AI systems."\n7. User: "Are there any new programming languages or frameworks gaining popularity for AI development?"\n8. AI: "Python remains dominant, but Julia and R are gaining traction. Frameworks like TensorFlow, PyTorch, and JAX are widely used."\n9. User: "Thanks for the detailed insights! This was very helpful."\n10. AI: "You''re most welcome! Is there anything else I can help you with today?"';


    prompt_type = 0;
    prompt_template = '';
    stream = $false;
    timeout = 60;
    client_reference = 'user-request-123';
    max_tokens = 1024;
    temperature = 0.7;
    top_p = 0.95;
    top_k = 40;
    presence_penalty = 0;
    frequency_penalty = 0
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri https://cortensor-ssh-production.up.railway.app/api/v1/completions -Method POST -Headers @{ "Content-Type" = "application/json"; "Authorization" = "Bearer 7412395a-011f-420d-bd1b-0e4960b3f3be" } -Body $body