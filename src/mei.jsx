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
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);

  const greetings = [
    "¡Hola, soy mei!"
  ];

  const getRandomGreeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    if (conversationHistory.length === 0 && messages.length === 0) {
      const initialGreeting = { sender: "system", text: getRandomGreeting() };
      setMessages([initialGreeting]);
      setShowWelcome(true);
    }
  }, [conversationHistory.length]);

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
      setShowWelcome(false);

      const userMessage = { sender: "user", text: input };
      setMessages(prev => [...prev.filter(m => m.sender !== "system"), userMessage]);
      setConversationHistory(prev => [...prev, userMessage]);

      const prompt = conversationHistory
        .map(message => `${message.sender}: ${message.text}`)
        .join("\n") + `\nuser: ${input}`;
        // ! Esto hay que cambiarlo al nombre del asistente de ia (No sé si se llamará mei)
      const res = await axios.post("https://miik.pythonanywhere.com/mei_assistant", {
        text: prompt,
      });

      if (res.data) {
        const aiResponse = { sender: "ai", text: res.data.response || res.data };
        setMessages(prev => [...prev, aiResponse]);
        setConversationHistory(prev => [...prev, aiResponse]);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }

      setInput("");
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { sender: "system", text: "Error al procesar tu solicitud. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setConversationHistory([]);
    setShowWelcome(true);
    localStorage.removeItem("conversationHistory");
  };

  // Estilos para los mensajes
  const messageStyles = {
    system: {
      padding: "1rem",
      borderRadius: "12px",
      textAlign: "center",
      maxWidth: "90%",
      margin: "0 auto",
      bgcolor: "neutral.100",
      color: "text.primary",
    },
    user: {
      alignSelf: "flex-end",
      bgcolor: "primary.600",
      padding: "0.75rem 1rem",
      borderRadius: "18px 18px 4px 18px",
      maxWidth: "85%",
      marginLeft: "15%",
    },
    ai: {
      alignSelf: "flex-start",
      bgcolor: "neutral.100",
      color: "text.primary",
      padding: "0.75rem 1rem",
      borderRadius: "18px 18px 18px 4px",
      maxWidth: "85%",
      marginRight: "15%",
    }
  };

  return (
    <Sheet sx={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Barra de título */}
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
          Mei
        </Typography>

        <Button
          onClick={handleClearHistory}
          variant="plain"
          sx={{
            position: "absolute",
            left: "16px",
            fontSize: "0.8rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "16px",
          }}
        >
          Nuevo Chat
        </Button>
      </Box>

      {/* Área de mensajes */}
      <Box
        sx={{
          position: "fixed",
          top: "56px",
          bottom: "60px",
          left: 0,
          right: 0,
          padding: "1rem",
          overflowY: "auto",
          bgcolor: "background.level2",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {showWelcome && messages.find(m => m.sender === "system") && (
          <Typography variant="soft" sx={messageStyles.system}>
            {messages.find(m => m.sender === "system")?.text}
          </Typography>
        )}

{messages
  .filter(m => !showWelcome || m.sender !== "system")
  .map((message, index) => (
    <Box
      key={index}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
        gap: "0.5rem", // Espaciado entre la imagen y el mensaje
      }}
    >
      {/* Mostrar imagen solo para mensajes del bot */}
      {message.sender === "ai" && (
        <Box
          component="img"
          src="mei.png" // Ruta de la imagen del bot
          alt="Bot"
          sx={{
            width: "40px",
            height: "40px",
            borderRadius: "50%", // Hacer la imagen circular
            objectFit: "cover",
          }}
        />
      )}

      {/* Contenedor del mensaje */}
      <Box
        sx={{
          alignSelf:
            message.sender === "user" ? "flex-end" : "flex-start",
          bgcolor:
            message.sender === "user" ? "primary.500" : "neutral.300",
          color: message.sender === "user" ? "white" : "text.primary",
          padding: "0.3rem 0.5rem", // Reduce el padding para hacerlo más compacto
          borderRadius: "12px",
          boxShadow: "sm",
          fontSize: "0.95rem",
          lineHeight: 1.2, // Reduce el espacio entre líneas
          maxWidth: "85%",
          minHeight: "1rem", // Reduce la altura mínima del mensaje
        }}
      >
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </Box>
    </Box>
  ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Barra de entrada */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          padding: "0.6rem 0.8rem",
          bgcolor: "background.level1",
          borderTop: "1px solid #ccc",
          zIndex: 1,
        }}
      >
        <Textarea
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onFocus={() => {
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }}
          minRows={1}
          maxRows={1}
          sx={{
            flex: 1,
            resize: "none",
            borderRadius: "8px",
            padding: "0.5rem",
          }}
        />

        <Button
          type="submit"
          disabled={loading || !input.trim()}
          variant="solid"
          sx={{
            height: "40px",
            minWidth: "90px",
            borderRadius: "6px",
            backgroundColor: "#1976d2",
            '&:hover': {
              backgroundColor: "#1565c0",
            },
            '&:disabled': {
              backgroundColor: "#1976d2",
              opacity: 0.7
            }
          }}
        >
          {loading ? <CircularProgress size="sm" /> : "Enviar"}
        </Button>
      </Box>
    </Sheet>
  );
};

export default ChatAI;