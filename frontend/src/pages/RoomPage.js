import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { API } from "@/App";
import { Play, Pause, RotateCcw, Send, Users, ArrowLeft, Copy, Check } from "lucide-react";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerInterval = useRef(null);

  const currentUserId = localStorage.getItem("currentUserId") || localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!currentUserId || !userName) {
      navigate("/rooms");
      return;
    }
    loadRoom();
    loadMessages();
    
    // Poll for updates every 3 seconds
    const pollInterval = setInterval(() => {
      loadRoom();
      loadMessages();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [roomId]);

  // Timer effect
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerInterval.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerInterval.current) {
              clearInterval(timerInterval.current);
            }
            // Timer finished
            alert("⏰ Süre doldu!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  const loadRoom = async () => {
    try {
      const res = await axios.get(`${API}/rooms/${roomId}`);
      setRoom(res.data);
      
      // Sync timer state from room
      if (res.data.timer_state) {
        setTimerMinutes(res.data.timer_state.duration_minutes);
        setIsRunning(res.data.timer_state.is_running);
        
        if (res.data.timer_state.is_running && res.data.timer_state.started_at) {
          // Calculate remaining time
          const startTime = new Date(res.data.timer_state.started_at);
          const now = new Date();
          const elapsed = Math.floor((now - startTime) / 1000);
          const total = res.data.timer_state.duration_minutes * 60;
          const remaining = Math.max(0, total - elapsed);
          setRemainingSeconds(remaining);
          
          if (remaining <= 0) {
            setIsRunning(false);
          }
        } else {
          setRemainingSeconds(res.data.timer_state.remaining_seconds || res.data.timer_state.duration_minutes * 60);
        }
      }
    } catch (error) {
      console.error("Error loading room:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/${roomId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      await axios.post(`${API}/messages`, {
        room_id: roomId,
        user_id: currentUserId,
        user_name: userName,
        user_study_field: null,
        content: newMessage
      });

      setNewMessage("");
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleStartTimer = async () => {
    const totalSeconds = timerMinutes * 60;
    setRemainingSeconds(totalSeconds);
    setIsRunning(true);

    try {
      await axios.put(`${API}/rooms/${roomId}/timer`, {
        is_running: true,
        duration_minutes: timerMinutes,
        remaining_seconds: totalSeconds,
        started_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  const handlePauseTimer = async () => {
    setIsRunning(false);

    try {
      await axios.put(`${API}/rooms/${roomId}/timer`, {
        is_running: false,
        duration_minutes: timerMinutes,
        remaining_seconds: remainingSeconds,
        started_at: null
      });
    } catch (error) {
      console.error("Error pausing timer:", error);
    }
  };

  const handleResetTimer = async () => {
    setIsRunning(false);
    const totalSeconds = timerMinutes * 60;
    setRemainingSeconds(totalSeconds);

    try {
      await axios.put(`${API}/rooms/${roomId}/timer`, {
        is_running: false,
        duration_minutes: timerMinutes,
        remaining_seconds: totalSeconds,
        started_at: null
      });
    } catch (error) {
      console.error("Error resetting timer:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Oda bulunamadı</p>
        <Button onClick={() => navigate("/rooms")}>Odalara Dön</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/rooms")} data-testid="btn-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900" data-testid="room-name">
                {room.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600 font-medium">Kod: {room.code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRoomCode}
                  data-testid="btn-copy-code"
                >
                  {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Left: Participants */}
        <div className="space-y-8">
          {/* Participants */}
          <Card data-testid="participants-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Katılımcılar ({room.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {room.participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                    data-testid={`participant-${participant.id}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {participant.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{participant.name}</p>
                      {participant.study_field && (
                        <p className="text-xs text-gray-500">{participant.study_field}</p>
                      )}
                    </div>
                    {participant.id === room.owner_id && (
                      <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                        Oda Sahibi
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timer - Centerpiece */}
          <Card className="border-primary/30 shadow-xl" data-testid="timer-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">⏱️ Kronometre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {/* Timer Input - Prioritized */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Çalışma Süresi
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="180"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 1)}
                      disabled={isRunning}
                      className="text-center text-2xl font-bold h-14 w-24 border-2"
                      data-testid="input-timer-minutes"
                    />
                    <span className="text-lg text-gray-600 font-medium">dakika</span>
                  </div>
                </div>
                
                {/* Timer Display - Secondary */}
                <div className="text-6xl font-extrabold text-primary mb-6" data-testid="timer-display">
                  {formatTime(remainingSeconds)}
                </div>

                <div className="flex gap-3 justify-center">
                  {!isRunning ? (
                    <Button onClick={handleStartTimer} size="lg" data-testid="btn-timer-start">
                      <Play className="h-5 w-5 mr-2" />
                      Başlat
                    </Button>
                  ) : (
                    <Button onClick={handlePauseTimer} variant="outline" size="lg" data-testid="btn-timer-pause">
                      <Pause className="h-5 w-5 mr-2" />
                      Duraklat
                    </Button>
                  )}
                  
                  <Button onClick={handleResetTimer} variant="outline" size="lg" data-testid="btn-timer-reset">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-6 px-4">
                  Kronometre tüm katılımcılar için senkronize
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Chat */}
        <Card className="md:col-span-2" data-testid="chat-card">
          <CardHeader>
            <CardTitle className="text-xl">💬 Sohbet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500 py-12 text-base">
                      Henüz mesaj yok. İlk mesajı sen gönder! 💬
                    </p>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.user_id === currentUserId ? 'flex-row-reverse' : ''}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                          {message.user_name[0].toUpperCase()}
                        </div>
                        <div className={`flex-1 max-w-[70%] ${message.user_id === currentUserId ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">{message.user_name}</span>
                            {message.user_study_field && (
                              <span className="text-xs text-gray-500">({message.user_study_field})</span>
                            )}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.user_id === currentUserId
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900 border'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-3">
                <Input
                  placeholder="Mesajını yaz..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="border-2"
                  data-testid="input-message"
                />
                <Button onClick={sendMessage} data-testid="btn-send-message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
