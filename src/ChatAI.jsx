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
  const [input, setInput] = useState(""); // Entrada del usuario
  const [messages, setMessages] = useState([]); // Lista de mensajes en la conversación
  const [conversationHistory, setConversationHistory] = useState(
    JSON.parse(localStorage.getItem("conversationHistory")) || []
  );
  const [loading, setLoading] = useState(false); // Estado de carga
  const messagesEndRef = useRef(null); // Referencia para desplazarse al final del chat

  const greetings = [
    "¡Que empiece la vaina!",
    "¡Epa, chamo!",
    "¿Qué hay, mi pana?",
    "¡Qué fue, hermano!",
    "¡Qué fue, vale!",
  ];

  // Selección aleatoria de un saludo
  const getRandomGreeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Inicializar el saludo si los mensajes están vacíos
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting = { sender: "system", text: getRandomGreeting() };
      setMessages([initialGreeting]);
      setConversationHistory((prev) => [...prev, initialGreeting]);
    }
  }, []);

  // Guardar el historial en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  // Desplazarse automáticamente al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Evita el envío de mensajes vacíos

    try {
      setLoading(true);

      // Añadir el mensaje del usuario
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: input },
      ]);
      setConversationHistory((prev) => [
        ...prev,
        { sender: "user", text: input },
      ]);

      // Formatear el historial como prompt
      const prompt = conversationHistory
        .map((message) => `${message.sender}: ${message.text}`)
        .join("\n") + `\nuser: ${input}`;

      // Solicitud al backend
      const res = await axios.post("https://miik.pythonanywhere.com/otprompt", {
        text: prompt,
      });

      // Validar y agregar la respuesta del servidor
      if (res.data && res.data.response) {
        const aiResponse = { sender: "ai", text: res.data.response };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setConversationHistory((prev) => [...prev, aiResponse]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "system", text: "No se recibió una respuesta válida del servidor." },
        ]);
      }

      setInput(""); // Limpiar la entrada
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "system", text: "Hubo un error al procesar tu solicitud. Intenta de nuevo más tarde." },
      ]);
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  // Manejar la limpieza del historial
  const handleClearHistory = () => {
    setMessages([]);
    setConversationHistory([]);
    localStorage.removeItem("conversationHistory");
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

        {/* Botón para borrar historial */}
        <Button
          onClick={handleClearHistory}
          variant="plain"
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            fontSize: "0.8rem",
            padding: "0.5rem",
          }}
        >
          Borrar historial
        </Button>
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
              : "flex-start",
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
                wordBreak: "break-word",
              }}
            >
              <ReactMarkdown>{message.text}</ReactMarkdown>
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
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
