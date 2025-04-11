import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Sheet,
  Typography,
  Textarea,
  Button,
  Box,
  CircularProgress,
} from "@mui/joy";

const ChatAI = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState(
    JSON.parse(localStorage.getItem("conversationHistory")) || []
  );
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const greetings = [
    "¡Que empiece la vaina!",
    "¡Epa, chamo!",
    "¿Qué hay, mi pana?",
    "¡Qué fue, hermano!",
    "¡Qué fue, vale!",
  ];

  const getRandomGreeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting = { sender: "system", text: getRandomGreeting() };
      setMessages([initialGreeting]);
      setConversationHistory((prev) => [...prev, initialGreeting]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setLoading(true);

      // Eliminar saludo inicial (si existe) antes de agregar el mensaje del usuario
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (message) => message.sender !== "system"
        );
        return [
          ...updatedMessages,
          { sender: "user", text: input }, // Agregar mensaje del usuario
        ];
      });

      // Agregar mensaje del usuario al historial
      setConversationHistory((prev) => [...prev, { sender: "user", text: input }]);

      // Crear el prompt con el historial
      const prompt = conversationHistory
        .map((message) => `${message.sender}: ${message.text}`)
        .join("\n") + `\nuser: ${input}`;

      // Llamada a la API
      const res = await axios.post("https://miik.pythonanywhere.com/otprompt", {
        text: prompt,
      });

      const aiResponse = { sender: "ai", text: res.data };
      
      // Agregar respuesta de la API al estado y al historial
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setConversationHistory((prev) => [...prev, aiResponse]);

      setInput("");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet sx={{ height: "100vh", width: "100%", boxSizing: "border-box" }}>
      {/* Título fijo */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "56px",
          bgcolor: "background.level1",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <Typography level="h1" sx={{ fontSize: "1.3rem", fontWeight: "bold" }}>
          Chat AI
        </Typography>
      </Box>

      {/* Contenedor de mensajes */}
      <Box
        sx={{
          position: "fixed",
          top: "56px",
          bottom: "72px",
          left: 0,
          right: 0,
          padding: "1rem",
          overflowY: "auto",
          bgcolor: "background.level2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent:
            messages.length === 1 && messages[0].sender === "system"
              ? "center"
              : "flex-start", // Centrar verticalmente solo el saludo
          gap: "0.5rem",
          boxSizing: "border-box",
        }}
      >
        {messages.map((message, index) =>
          message.sender === "system" ? (
            <Typography
              variant="soft"
              color="neutral"
              level="h1"
              key={index}
              sx={{
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "md",
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: "90%",
              }}
            >
              {message.text}
            </Typography>
          ) : (
            <Box
              key={index}
              sx={{
                alignSelf:
                  message.sender === "user" ? "flex-end" : "flex-start",
                bgcolor:
                  message.sender === "user" ? "primary.500" : "neutral.300",
                color: message.sender === "user" ? "white" : "text.primary",
                padding: "0.75rem",
                borderRadius: "12px",
                boxShadow: "sm",
                fontSize: "1rem",
                lineHeight: 1.4,
                maxWidth: "85%",
              }}
            >
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      style={{
                        margin: 0,
                        wordWrap: "break-word",
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </Box>
          )
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Barra de entrada fija */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "72px",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          padding: "0.8rem",
          bgcolor: "background.level1",
          borderTop: "1px solid #ccc",
          zIndex: 1,
          boxSizing: "border-box",
        }}
      >
        <Textarea
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          minRows={1}
          maxRows={2}
          sx={{
            flex: 1,
            resize: "none",
            borderRadius: "8px",
            padding: "0.5rem",
            fontSize: "0.9rem",
          }}
        />
        <Button
          type="submit"
          disabled={loading}
          variant="solid"
          sx={{
            height: "40px",
            width: "90px",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        >
          {loading ? (
            <CircularProgress size="sm" sx={{ color: "inherit" }} />
          ) : (
            "Enviar"
          )}
        </Button>
      </Box>
    </Sheet>
  );
};

export default ChatAI;
