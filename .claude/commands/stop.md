# Stop CYAss Application

Stop the CYAss development server by pressing `Ctrl+C` in the terminal where `scripts\run.bat` is running.

If the process is running in the background, you can also run:
```bash
taskkill /f /im node.exe
```

Note: This will stop all Node.js processes, so use with caution if you have other Node applications running.