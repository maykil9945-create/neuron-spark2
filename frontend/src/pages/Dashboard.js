import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { API } from "@/App";
import { Plus, Trash2, Edit, Users, Home } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    lesson: "",
    topic: "",
    duration: 30,
    day: "Pazartesi"
  });

  const profileId = localStorage.getItem("profileId");
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!profileId) {
      navigate("/program/create");
      return;
    }
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const loadPrograms = async () => {
    try {
      const res = await axios.get(`${API}/programs/${profileId}`);
      setPrograms(res.data);
      if (res.data.length > 0) {
        setSelectedProgram(res.data[0]);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId) => {
    const updatedTasks = selectedProgram.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    try {
      await axios.put(`${API}/programs/${selectedProgram.id}`, {
        tasks: updatedTasks
      });
      setSelectedProgram({ ...selectedProgram, tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.lesson.trim() || !newTask.topic.trim()) {
      alert("Ders ve konu alanları boş olamaz");
      return;
    }

    const task = {
      id: Date.now().toString(),
      lesson: newTask.lesson,
      topic: newTask.topic,
      duration: newTask.duration,
      day: newTask.day,
      completed: false
    };

    const updatedTasks = [...selectedProgram.tasks, task];

    try {
      await axios.put(`${API}/programs/${selectedProgram.id}`, {
        tasks: updatedTasks
      });
      setSelectedProgram({ ...selectedProgram, tasks: updatedTasks });
      setNewTask({ lesson: "", topic: "", duration: 30, day: "Pazartesi" });
      setShowAddTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = selectedProgram.tasks.filter(task => task.id !== taskId);

    try {
      await axios.put(`${API}/programs/${selectedProgram.id}`, {
        tasks: updatedTasks
      });
      setSelectedProgram({ ...selectedProgram, tasks: updatedTasks });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTodaysTasks = () => {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long' });
    const dayMap = {
      'Pazartesi': 'Pazartesi',
      'Salı': 'Salı',
      'Çarşamba': 'Çarşamba',
      'Perşembe': 'Perşembe',
      'Cuma': 'Cuma',
      'Cumartesi': 'Cumartesi',
      'Pazar': 'Pazar'
    };
    
    return selectedProgram?.tasks.filter(task => task.day === dayMap[today] || task.day === today) || [];
  };

  const getProgress = () => {
    if (!selectedProgram || selectedProgram.tasks.length === 0) return 0;
    const completed = selectedProgram.tasks.filter(t => t.completed).length;
    return Math.round((completed / selectedProgram.tasks.length) * 100);
  };

  const groupTasksByDay = () => {
    const grouped = {};
    selectedProgram?.tasks.forEach(task => {
      if (!grouped[task.day]) {
        grouped[task.day] = [];
      }
      grouped[task.day].push(task);
    });
    return grouped;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  if (!selectedProgram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-xl mb-4">Henüz program oluşturmadın</p>
        <Button onClick={() => navigate("/program/create")}>Program Oluştur</Button>
      </div>
    );
  }

  const todaysTasks = getTodaysTasks();
  const tasksByDay = groupTasksByDay();

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2" data-testid="dashboard-title">
              Merhaba, {userName}! 👋
            </h1>
            <p className="text-base text-gray-600 font-medium">
              {selectedProgram.exam_goal} • {selectedProgram.daily_hours} saat/gün
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")} data-testid="btn-home">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/rooms")} data-testid="btn-rooms">
              <Users className="mr-2 h-4 w-4" />
              Odalara Git
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-semibold text-gray-700">Genel İlerleme</span>
              <span className="text-lg font-bold text-primary" data-testid="progress-percentage">
                {getProgress()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary to-accent h-4 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8">
        {/* Today's Tasks - Main Focus (3 columns) */}
        <Card className="md:col-span-3 border-primary/20" data-testid="todays-tasks-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center text-2xl">
              <span className="text-primary">Bugün Yapılacaklar</span>
              <span className="text-base font-semibold text-gray-500">
                {todaysTasks.filter(t => t.completed).length}/{todaysTasks.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-base">Bugün için görev yok</p>
            ) : (
              <div className="space-y-4">
                {todaysTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 rounded-lg border-2 hover:bg-gray-50 hover:border-primary/30 transition-all"
                    data-testid={`task-${task.id}`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskComplete(task.id)}
                      data-testid={`checkbox-${task.id}`}
                    />
                    <div className="flex-1">
                      <p className={`font-semibold text-base ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.lesson} - {task.topic}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{task.duration} dakika</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      data-testid={`delete-${task.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Program - Secondary (2 columns) */}
        <Card className="md:col-span-2" data-testid="weekly-program-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center text-lg">
              <span>Haftalık Program</span>
              <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="btn-add-task">
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Görev Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lesson">Ders</Label>
                      <Input
                        id="lesson"
                        value={newTask.lesson}
                        onChange={(e) => setNewTask({ ...newTask, lesson: e.target.value })}
                        placeholder="Örn: Matematik"
                        data-testid="input-new-lesson"
                      />
                    </div>
                    <div>
                      <Label htmlFor="topic">Konu</Label>
                      <Input
                        id="topic"
                        value={newTask.topic}
                        onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                        placeholder="Örn: İntegral"
                        data-testid="input-new-topic"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Süre (dakika)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newTask.duration}
                        onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 30 })}
                        data-testid="input-new-duration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="day">Gün</Label>
                      <select
                        id="day"
                        className="w-full p-2 border-2 rounded-lg"
                        value={newTask.day}
                        onChange={(e) => setNewTask({ ...newTask, day: e.target.value })}
                        data-testid="select-new-day"
                      >
                        <option>Pazartesi</option>
                        <option>Salı</option>
                        <option>Çarşamba</option>
                        <option>Perşembe</option>
                        <option>Cuma</option>
                        <option>Cumartesi</option>
                        <option>Pazar</option>
                      </select>
                    </div>
                    <Button onClick={addTask} className="w-full" data-testid="btn-save-task">
                      Kaydet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {Object.keys(tasksByDay).length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">Henüz görev eklenmedi</p>
              ) : (
                Object.entries(tasksByDay).map(([day, tasks]) => (
                  <div key={day} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-bold mb-3 text-primary text-sm">{day}</h3>
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md"
                        >
                          <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                            {task.lesson} - {task.topic}
                          </span>
                          <span className="text-gray-500 text-xs font-medium">{task.duration}dk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
