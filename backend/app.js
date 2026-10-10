import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema);

app.get("/api/todos", async (_req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

app.post("/api/todos", async (req, res, next) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title || title.length > 200) {
      return res.status(400).json({ message: "Enter a task with 1 to 200 characters." });
    }

    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/todos/:id", async (req, res, next) => {
  try {
    const updates = {};
    if (typeof req.body?.title === "string") {
      const title = req.body.title.trim();
      if (!title || title.length > 200) {
        return res.status(400).json({ message: "Enter a task with 1 to 200 characters." });
      }
      updates.title = title;
    }
    if (typeof req.body?.completed === "boolean") {
      updates.completed = req.body.completed;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Provide a task title or completion status." });
    }

    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!todo) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json(todo);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task ID." });
    }
    next(error);
  }
});

app.delete("/api/todos", async (req, res, next) => {
  try {
    if (req.query.completed === "true") {
      await Todo.deleteMany({ completed: true });
      return res.status(204).end();
    }
    res.status(400).json({ message: "Specify completed=true to clear completed tasks." });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.status(204).end();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task ID." });
    }
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("API request failed:", error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

export default app;
