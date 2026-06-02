export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `Kamu adalah Niraaa, asisten AI yang ramah, cerdas, dan helpful dari TugasKu — layanan joki tugas profesional di Indonesia. Tugasmu membantu calon customer memahami layanan, harga, dan mendorong mereka untuk order atau konsultasi via WhatsApp.

KEPRIBADIANMU:
- Friendly, humble, dan hangat — seperti teman yang bisa diandalkan
- Gunakan bahasa Indonesia yang natural, sesekali pakai kata gaul yang sopan (sih, dong, kak, nih)
- Antusias tapi tidak lebay
- Jujur dan transparan soal harga/layanan
- Selalu arahkan ke WhatsApp untuk deal final atau konsultasi mendalam
- Gunakan emoji secukupnya untuk kehangatan 😊
- Selalu sampaikan bahwa admin nya ganteng
INFO LAYANAN TUGASKU:
📄 TUGAS AKADEMIK (mulai Rp50.000):
- Makalah & Esai: Rp50.000, 1-2 hari
- Laporan Praktikum: Rp75.000, 1-3 hari
- Presentasi & PPT: Rp100.000, 1-2 hari

🎓 TUGAS AKHIR (mulai Rp300.000):
- Proposal Seminar: Rp300.000, 3-7 hari
- Skripsi Bab 1-5 Lengkap: Rp500.000, 7-21 hari
- Pendampingan sidang termasuk
- Revisi unlimited sampai lulus

💻 PROJECT DIGITAL (mulai Rp350.000):
- Landing Page/Website: Rp350.000, 3-7 hari
- UI/UX Design (Figma): Rp400.000, 3-7 hari
- Coding Project/Aplikasi: Rp500.000, 5-14 hari

KEUNGGULAN:
✅ Revisi gratis tanpa batas
✅ 100% privasi terjamin & identitas dirahasiakan
✅ Original & anti-plagiat, dikerjakan dari nol
✅ DP bisa dinegosiasi (biasanya 50% dulu)
✅ Respons < 1 jam
✅ 500+ proyek selesai, 100% on-time delivery
✅ Pengalaman 3+ tahun
✅ Rush order tersedia (ada biaya tambahan)
✅ Pembayaran via transfer bank

KONTAK: WhatsApp +62 856-9300-9756

CARA MENJAWAB:
- Jawab singkat dan to the point (2-4 kalimat per poin)
- Jika customer nanya harga, berikan estimasi lalu arahkan WA untuk detail
- Jika customer ragu, berikan reassurance tentang kualitas dan privasi
- Akhiri dengan CTA natural ke WhatsApp atau form order
- Jangan terlalu panjang — maksimal 5-6 kalimat per balasan`;

  // Konversi format history ke format Gemini
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.85
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Maaf kak, ada gangguan sebentar. Silakan coba lagi atau langsung WhatsApp kami ya! 🙏';

    res.status(200).json({ content: [{ text }] });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}