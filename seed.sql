-- Seed data Lamarr & Nikkah Planner (berdasarkan riset file user)

-- =============== CHECKLIST ITEMS ===============
INSERT OR IGNORE INTO checklist_items (category, title, description, pic, target_time, priority, sort_order) VALUES
-- Legal & Administrasi
('legal', 'KTP, KK, akta kelahiran', 'Dokumen identitas dasar kedua calon', 'Pasangan', 'H-4 bulan', 'tinggi', 1),
('legal', 'Pas foto ukuran sesuai syarat KUA', 'Biasanya 2x3, 3x4, 4x6 latar biru/merah', 'Pasangan', 'H-4 bulan', 'tinggi', 2),
('legal', 'Surat pengantar nikah dari kelurahan/desa', 'N1-N4 bila diperlukan wilayah setempat', 'Pasangan + keluarga', 'H-4 bulan', 'tinggi', 3),
('legal', 'Data orang tua / wali', 'KTP & KK orang tua kedua belah pihak', 'Keluarga inti', 'H-4 bulan', 'tinggi', 4),
('legal', 'Sertifikat bimbingan perkawinan', 'Bila diwajibkan oleh KUA setempat', 'Pasangan', 'H-3 bulan', 'sedang', 5),
('legal', 'Pemeriksaan kesehatan pranikah', 'Tes darah, HIV, hepatitis sesuai aturan daerah', 'Pasangan', 'H-3 bulan', 'sedang', 6),
-- Keuangan
('keuangan', 'Tentukan total budget', 'Batas atas anggaran lamaran + nikah', 'Pasangan', 'H-6 bulan', 'tinggi', 1),
('keuangan', 'Tentukan pembagian biaya antar pihak', 'Keluarga pria vs wanita vs pasangan', 'Pasangan + keluarga', 'H-6 bulan', 'tinggi', 2),
('keuangan', 'Tentukan prioritas pengeluaran utama', 'Venue, katering, dokumentasi, MUA', 'Pasangan', 'H-6 bulan', 'tinggi', 3),
('keuangan', 'Siapkan dana cadangan 10-15%', 'Buffer untuk biaya mendadak', 'Pasangan', 'H-6 bulan', 'tinggi', 4),
('keuangan', 'Kontrol biaya kecil (tip, ongkir, transport)', 'Pos kecil yang sering bocor', 'Pasangan', 'H-2 bulan', 'sedang', 5),
-- Acara inti
('acara', 'Tentukan model acara (akad saja / + resepsi)', 'Menentukan skala & biaya', 'Pasangan + keluarga', 'H-6 bulan', 'tinggi', 1),
('acara', 'Tentukan venue (rumah / gedung)', 'Pengaruh besar ke budget', 'Pasangan + keluarga', 'H-6 bulan', 'tinggi', 2),
('acara', 'Tentukan adat (lengkap / sederhana)', 'Adat Jawa, Sunda, Minang, dll', 'Keluarga + pasangan', 'H-5 bulan', 'sedang', 3),
('acara', 'Booking vendor utama', 'Venue, katering, dekor, MUA, foto/video', 'Pasangan + WO', 'H-5 bulan', 'tinggi', 4),
('acara', 'Undangan & souvenir', 'Finalisasi desain dan jumlah', 'Pasangan', 'H-3 bulan', 'sedang', 5),
-- Keluarga & Adat
('keluarga', 'Tentukan bentuk acara lamaran', 'Kecil keluarga vs tamu terbatas', 'Keluarga + pasangan', 'H-5 bulan', 'sedang', 1),
('keluarga', 'Tentukan isi hantaran / seserahan', 'Sekitar Rp500rb atau lebih', 'Keluarga + pasangan', 'H-1 bulan', 'sedang', 2),
('keluarga', 'Tentukan juru bicara keluarga', 'Pembawa acara adat', 'Keluarga', 'H-4 bulan', 'sedang', 3),
('keluarga', 'Sepakati jumlah tamu tiap pihak', 'Pengaruh langsung ke katering', 'Pasangan + keluarga', 'H-3 bulan', 'tinggi', 4),
('keluarga', 'Sepakati kontribusi biaya tiap pihak', 'Hindari miskomunikasi', 'Pasangan + keluarga', 'H-5 bulan', 'tinggi', 5),
-- Mental & Rumah Tangga
('mental', 'Rencana tempat tinggal setelah menikah', 'Kontrak, beli, atau ikut keluarga', 'Pasangan', 'H-2 bulan', 'sedang', 1),
('mental', 'Tabungan awal rumah tangga', 'Dana darurat 3-6 bulan', 'Pasangan', 'H-2 bulan', 'sedang', 2),
('mental', 'Pembagian peran suami istri', 'Keuangan, pekerjaan rumah, anak', 'Pasangan', 'H-2 bulan', 'sedang', 3),
('mental', 'Target finansial tahun pertama', 'Tabungan, investasi, cicilan', 'Pasangan', 'H-1 bulan', 'sedang', 4),
('mental', 'Asuransi kesehatan / BPJS aktif', 'Perlindungan kesehatan keluarga', 'Pasangan', 'H-1 bulan', 'rendah', 5);

-- =============== BUDGET ITEMS (3 Skenario) ===============
-- LAMARAN
INSERT OR IGNORE INTO budget_items (bucket, item_name, estimated_min, estimated_max, scenario, notes) VALUES
('lamaran', 'Dekorasi sederhana', 500000, 500000, 'hemat', 'Dekor rumah minimalis'),
('lamaran', 'Pakaian / tata rias', 500000, 1000000, 'hemat', 'MUA rumahan'),
('lamaran', 'Konsumsi keluarga', 1000000, 2000000, 'hemat', 'Katering prasmanan kecil'),
('lamaran', 'Dokumentasi', 200000, 1000000, 'hemat', 'Foto prewed sederhana'),
('lamaran', 'Cincin lamaran', 800000, 1000000, 'hemat', 'Emas / perak sederhana'),
('lamaran', 'Hantaran / seserahan', 500000, 500000, 'hemat', '5-7 jenis hantaran');

-- NIKAH 3 SKENARIO
INSERT OR IGNORE INTO budget_items (bucket, item_name, estimated_min, estimated_max, scenario, notes) VALUES
-- HEMAT (Rp50-65 juta)
('nikah', 'Paket vendor inti 200 tamu', 45000000, 50000000, 'hemat', 'Venue + katering + dekor + MUA + foto'),
('nikah', 'Cincin kawin + mahar', 2000000, 5000000, 'hemat', 'Emas muda sederhana'),
('nikah', 'Undangan + souvenir', 1500000, 3000000, 'hemat', 'Digital + fisik terbatas'),
('nikah', 'Transport & adat', 1500000, 3000000, 'hemat', 'Sederhana'),
('nikah', 'Dana cadangan', 3000000, 5000000, 'hemat', 'Buffer 10-15%'),
-- MENENGAH (Rp65-75 juta)
('nikah', 'Paket vendor inti 200 tamu', 55000000, 60000000, 'menengah', 'Venue gedung + katering premium'),
('nikah', 'Cincin kawin + mahar', 5000000, 10000000, 'menengah', 'Emas + batu mulia'),
('nikah', 'Undangan + souvenir', 3000000, 5000000, 'menengah', 'Cetak premium'),
('nikah', 'Transport & adat', 3000000, 5000000, 'menengah', 'Adat Jawa lengkap'),
('nikah', 'Dana cadangan', 5000000, 8000000, 'menengah', 'Buffer 10-15%'),
-- PREMIUM (Rp75-90 juta)
('nikah', 'Paket vendor inti 200 tamu', 65000000, 75000000, 'premium', 'Gedung mewah + katering chef'),
('nikah', 'Cincin kawin + mahar', 10000000, 20000000, 'premium', 'Berlian / emas premium'),
('nikah', 'Undangan + souvenir', 5000000, 8000000, 'premium', 'Custom handmade'),
('nikah', 'Transport & adat', 5000000, 8000000, 'premium', 'Adat lengkap + live band'),
('nikah', 'Dana cadangan', 8000000, 12000000, 'premium', 'Buffer 10-15%');

-- AKAD
INSERT OR IGNORE INTO budget_items (bucket, item_name, estimated_min, estimated_max, scenario, notes) VALUES
('akad', 'Biaya akad di kantor KUA', 0, 0, 'hemat', 'GRATIS - resmi Kemenag'),
('akad', 'Biaya akad di luar kantor KUA', 600000, 600000, 'menengah', 'Resmi Kemenag Rp600.000');

-- =============== TIMELINE TASKS ===============
INSERT OR IGNORE INTO timeline_tasks (phase, phase_order, task, owner) VALUES
-- H-6 bulan
('H-6 bulan', 1, 'Tentukan tanggal pernikahan', 'Pasangan + keluarga'),
('H-6 bulan', 1, 'Tentukan konsep acara (adat / modern)', 'Pasangan + keluarga'),
('H-6 bulan', 1, 'Tentukan lokasi (kota & venue)', 'Pasangan + keluarga'),
('H-6 bulan', 1, 'Tentukan kisaran jumlah tamu', 'Pasangan + keluarga'),
('H-6 bulan', 1, 'Tentukan budget total + pembagian', 'Pasangan + keluarga'),
-- H-5 bulan
('H-5 bulan', 2, 'Booking venue / gedung', 'Pasangan + WO'),
('H-5 bulan', 2, 'Booking katering', 'Pasangan + WO'),
('H-5 bulan', 2, 'Booking MUA + busana', 'Pasangan'),
('H-5 bulan', 2, 'Booking dokumentasi foto/video', 'Pasangan'),
('H-5 bulan', 2, 'Booking dekorasi', 'Pasangan + WO'),
-- H-4 bulan
('H-4 bulan', 3, 'Urus dokumen nikah ke KUA', 'Pasangan'),
('H-4 bulan', 3, 'Rapikan data keluarga (N1-N4)', 'Keluarga'),
('H-4 bulan', 3, 'Bahas detail lamaran & seserahan', 'Keluarga + pasangan'),
('H-4 bulan', 3, 'Tentukan mahar', 'Pasangan + keluarga'),
-- H-3 bulan
('H-3 bulan', 4, 'Finalkan konsep acara + rundown kasar', 'Pasangan + WO'),
('H-3 bulan', 4, 'Susun daftar tamu', 'Pasangan + keluarga'),
('H-3 bulan', 4, 'Pesan undangan', 'Pasangan'),
('H-3 bulan', 4, 'Pesan souvenir', 'Pasangan'),
-- H-2 bulan
('H-2 bulan', 5, 'Food tasting katering', 'Pasangan'),
('H-2 bulan', 5, 'Fitting busana pengantin', 'Pasangan'),
('H-2 bulan', 5, 'Revisi jumlah tamu ke vendor', 'Pasangan'),
('H-2 bulan', 5, 'Pembayaran termin vendor', 'Pasangan'),
-- H-1 bulan
('H-1 bulan', 6, 'Cek final dokumen nikah', 'Pasangan'),
('H-1 bulan', 6, 'Konfirmasi ulang semua vendor', 'Pasangan + WO'),
('H-1 bulan', 6, 'Pembagian tugas keluarga inti', 'Keluarga'),
-- H-2 minggu
('H-2 minggu', 7, 'Konfirmasi kedatangan tamu VIP', 'Pasangan + keluarga'),
('H-2 minggu', 7, 'Susunan acara final', 'Pasangan + WO'),
('H-2 minggu', 7, 'Kendaraan pengantin & keluarga', 'Keluarga'),
('H-2 minggu', 7, 'Perlengkapan akad (meja, kursi, mahar)', 'Keluarga'),
-- H-1 hari
('H-1 hari', 8, 'Istirahat cukup', 'Pasangan'),
('H-1 hari', 8, 'Pengecekan cincin', 'Pasangan'),
('H-1 hari', 8, 'Cek ulang dokumen nikah', 'Pasangan'),
('H-1 hari', 8, 'Cek busana + perlengkapan', 'Pasangan'),
('H-1 hari', 8, 'Koordinasi akhir dengan keluarga', 'Keluarga');

-- =============== ADAT JAWA STAGES ===============
INSERT OR IGNORE INTO adat_stages (stage_name, stage_order, description, modern_equivalent) VALUES
('Congkong', 1, 'Tahap penjajakan awal dari pihak laki-laki untuk mengetahui kesiapan dan kesediaan pihak perempuan. Belum acara besar, melainkan pendekatan sopan.', 'Penjajakan informal antar keluarga / kenalan awal'),
('Salar', 2, 'Tindak lanjut untuk memperoleh kepastian apakah hubungan akan dibawa ke tahap lebih serius. Konfirmasi keseriusan antar keluarga.', 'Pertemuan keluarga kecil / sowan'),
('Nontoni', 3, 'Pertemuan lebih resmi agar kedua calon dan keluarga bisa saling mengenal dan menilai kecocokan.', 'Makan malam keluarga formal'),
('Ngelamar', 4, 'Tahap lamaran resmi. Mulai dibicarakan komitmen antar keluarga, arah hubungan, kemungkinan tanggal acara, dan persiapan pernikahan.', 'Lamaran resmi + tukar cincin');
