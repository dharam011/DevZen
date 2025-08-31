const aiService = require("../services/ai.service")

module.exports.getReview = async (req,res)=>{
    const { code, language } = req.body
    if(!code){
        return res.status(400).send("code is required")
    }
    const response = await aiService(code, "review", language);
    res.send(response);
}

module.exports.getOutput = async (req,res)=>{
    const { code, language } = req.body
    if(!code){
        return res.status(400).send("code is required")
    }
    const response = await aiService(code, "output", language);
    res.send(response);
}

module.exports.chat = async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).send("message is required");
  }
  
  try {
    // Format chat history for the AI
    let contextPrompt = "";
    if (history.length > 0) {
      contextPrompt = "Previous conversation:\n";
      history.forEach(msg => {
        contextPrompt += `${msg.role === 'user' ? 'User' : 'CODG'}: ${msg.content}\n`;
      });
      contextPrompt += "\nCurrent message:\n";
    }
    
    const fullPrompt = contextPrompt + message;
    const response = await aiService(fullPrompt, "chat");
    res.send(response);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).send("An error occurred during the chat.");
  }
};