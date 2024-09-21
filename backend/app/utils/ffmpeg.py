import asyncio
import subprocess

async def run_ffmpeg_command(command):
    print(f"Running FFmpeg command: {' '.join(command)}")
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        print(f"FFmpeg command failed: {stderr.decode()}")
        raise RuntimeError(f"FFmpeg command failed: {stderr.decode()}")
    
    print(f"FFmpeg command output: {stdout.decode()}")
    print(f"FFmpeg command error output: {stderr.decode()}")
    
    return stdout.decode(), stderr.decode()
