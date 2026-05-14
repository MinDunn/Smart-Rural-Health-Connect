import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await result.json();
    console.log('--- DANH SÁCH MODEL KHẢ DỤNG CỦA BẠN ---');
    if (data.models) {
      data.models.forEach((m: any) => console.log(`- ${m.name}`));
    } else {
      console.log('Không lấy được danh sách model:', data);
    }
  } catch (e) {
    console.error('Lỗi khi kiểm tra:', e.message);
  }
}

listModels();
