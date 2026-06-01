import { NextResponse } from 'next/server';
import { readdirSync } from 'fs';
import { join } from 'path';

const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a', '.aac', '.webm']);

export async function GET() {
  const dir = join(process.cwd(), 'public', 'audio');
  let files: string[];
  try {
    files = readdirSync(dir).filter(f => AUDIO_EXTS.has(f.slice(f.lastIndexOf('.')).toLowerCase()));
  } catch {
    files = [];
  }
  files.sort((a, b) => a.localeCompare(b, 'es'));
  return NextResponse.json({ files });
}
