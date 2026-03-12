'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Upload, X, Plus, Info } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { useSupabase } from '@/hooks/useSupabase';
import { RANKS, SERVERS } from '@/utils/pubg';
import { cn } from '@/utils/cn';

const schema = z.object({
  title_uz: z.string().min(5, 'Min 5 belgi').max(100),
  title_en: z.string().max(100).optional(),
  description_uz: z.string().min(20, 'Min 20 belgi').max(5000),
  description_en: z.string().max(5000).optional(),
  pubg_rank: z.string(),
  pubg_level: z.coerce.number().min(1).max(100),
  pubg_server: z.string(),
  uc_balance: z.coerce.number().min(0),
  skin_count: z.coerce.number().min(0),
  legendary_count: z.coerce.number().min(0),
  outfit_count: z.coerce.number().min(0),
  gun_skin_count: z.coerce.number().min(0),
  price: z.coerce.number().min(1000, 'Min 1000 so\'m'),
  is_negotiable: z.boolean().default(false),
  is_instant_buy: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function NewListingForm({ locale, sellerId }: { locale: Locale; sellerId: string }) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pubg_rank: 'gold',
      pubg_server: 'asia',
      pubg_level: 30,
      is_instant_buy: true,
      is_negotiable: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      // 1. Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (const file of images) {
        const path = `accounts/${sellerId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('account-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('account-images').getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      // 2. Generate slug
      const slug = data.title_en
        ? data.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : data.title_uz.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '-');
      const uniqueSlug = `${slug}-${Date.now()}`;

      // 3. Insert account
      const { data: account, error } = await supabase
        .from('accounts_for_sale')
        .insert({
          seller_id: sellerId,
          title: data.title_uz,
          slug: uniqueSlug,
          ...data,
          images: imageUrls,
          status: 'pending_review',
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success(locale === 'uz' ? 'Akkaunt moderatsiyaga yuborildi!' : 'Account submitted for review!');
      router.push(`/${locale}/seller-dashboard`);
    } catch (err: any) {
      toast.error(err.message ?? (locale === 'uz' ? 'Xato yuz berdi' : 'An error occurred'));
    } finally {
      setUploading(false);
    }
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 10));
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <div className="card p-5">
        <label className="block text-sm font-semibold text-white mb-3">
          {locale === 'uz' ? 'Rasmlar (max 10)' : 'Images (max 10)'}
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((file, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-surface-border">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-dark-900/80 rounded-full flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {images.length < 10 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-500/50 transition-colors">
              <Plus size={16} className="text-dark-300" />
              <span className="text-xs text-dark-400">{locale === 'uz' ? 'Qo\'shish' : 'Add'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
            </label>
          )}
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-white">{locale === 'uz' ? "Asosiy ma'lumotlar" : 'Basic Info'}</h3>

        <FormField label={locale === 'uz' ? 'Sarlavha (UZ)' : 'Title (UZ)'} error={errors.title_uz?.message}>
          <input {...register('title_uz')} className={cn('input', errors.title_uz && 'border-accent-red')} placeholder={locale === 'uz' ? 'Masalan: Conqueror akkaunt, ko\'p skinlar...' : 'e.g. Conqueror account, lots of skins...'} />
        </FormField>

        <FormField label={locale === 'uz' ? 'Sarlavha (EN)' : 'Title (EN)'} error={errors.title_en?.message}>
          <input {...register('title_en')} className="input" placeholder="e.g. Conqueror account with rare skins..." />
        </FormField>

        <FormField label={locale === 'uz' ? 'Tavsif (UZ)' : 'Description (UZ)'} error={errors.description_uz?.message}>
          <textarea {...register('description_uz')} rows={4} className={cn('input resize-none', errors.description_uz && 'border-accent-red')} placeholder={locale === 'uz' ? "Akkaunt haqida batafsil ma'lumot..." : 'Detailed account description...'} />
        </FormField>

        <FormField label={locale === 'uz' ? 'Tavsif (EN)' : 'Description (EN)'}>
          <textarea {...register('description_en')} rows={3} className="input resize-none" placeholder="Detailed description in English..." />
        </FormField>
      </div>

      {/* PUBG Stats */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-white">PUBG Stats</h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={locale === 'uz' ? 'Eng yuqori rang' : 'Highest Rank'}>
            <select {...register('pubg_rank')} className="input">
              {RANKS.map((r) => <option key={r.value} value={r.value}>{r.label[locale]}</option>)}
            </select>
          </FormField>

          <FormField label={locale === 'uz' ? 'Server' : 'Server'}>
            <select {...register('pubg_server')} className="input">
              {SERVERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>

          <FormField label={locale === 'uz' ? 'Daraja' : 'Level'} error={errors.pubg_level?.message}>
            <input type="number" {...register('pubg_level')} className="input" min={1} max={100} />
          </FormField>

          <FormField label="UC Balance">
            <input type="number" {...register('uc_balance')} className="input" min={0} />
          </FormField>

          <FormField label={locale === 'uz' ? 'Skinlar soni' : 'Total Skins'}>
            <input type="number" {...register('skin_count')} className="input" min={0} />
          </FormField>

          <FormField label={locale === 'uz' ? 'Legendar narsalar' : 'Legendaries'}>
            <input type="number" {...register('legendary_count')} className="input" min={0} />
          </FormField>

          <FormField label={locale === 'uz' ? 'Kiyimlar' : 'Outfits'}>
            <input type="number" {...register('outfit_count')} className="input" min={0} />
          </FormField>

          <FormField label={locale === 'uz' ? 'Qurol skinlari' : 'Gun Skins'}>
            <input type="number" {...register('gun_skin_count')} className="input" min={0} />
          </FormField>
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-white">{locale === 'uz' ? 'Narx va sozlamalar' : 'Pricing & Options'}</h3>

        <FormField label={locale === 'uz' ? "Narx (so'm)" : 'Price (UZS)'} error={errors.price?.message}>
          <input type="number" {...register('price')} className={cn('input', errors.price && 'border-accent-red')} min={1000} placeholder="500000" />
        </FormField>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_instant_buy')} className="w-4 h-4 accent-brand-500 rounded" />
            <span className="text-sm text-dark-200">{locale === 'uz' ? 'Darhol sotib olish' : 'Instant Buy'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_negotiable')} className="w-4 h-4 accent-brand-500 rounded" />
            <span className="text-sm text-dark-200">{locale === 'uz' ? 'Narx kelishiladi' : 'Negotiable'}</span>
          </label>
        </div>

        {/* Commission notice */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
          <Info size={14} className="text-brand-400 mt-0.5 shrink-0" />
          <p className="text-xs text-dark-300">
            {locale === 'uz'
              ? "Platforma komissiyasi: 8%. Muvaffaqiyatli sotuvdan keyin avtomatik ushlab qolinadi."
              : "Platform commission: 8%. Automatically deducted after successful sale."}
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="btn-primary w-full btn-lg"
      >
        {isSubmitting || uploading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
            {locale === 'uz' ? 'Yuborilmoqda...' : 'Submitting...'}
          </span>
        ) : (
          locale === 'uz' ? 'Moderatsiyaga yuborish' : 'Submit for Review'
        )}
      </button>
    </form>
  );
}

function FormField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark-200 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
    </div>
  );
}
