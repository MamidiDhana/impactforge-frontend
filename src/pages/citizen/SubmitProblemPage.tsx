import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { CitizenLayout } from '../../layouts/CitizenLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { JharkhandMapPicker } from '../../components/citizen/JharkhandMapPicker'
import { TrackIdConfirmationModal } from '../../components/citizen/TrackIdConfirmationModal'
import { useAuth } from '../../context/AuthContext'
import { useProblems } from '../../context/ProblemContext'
import { JHARKHAND_DISTRICTS, REPORT_PROBLEM_TRANSLATIONS } from '../../data/jharkhandData'
import type { CitizenProblem } from '../../types'

const CATEGORY_KEYS = [
  'Water and Sanitation',
  'Healthcare',
  'Education',
  'Agriculture',
  'Environment',
  'Public Safety',
  'Accessibility',
  'Rural Development',
  'Digital Services',
  'Other',
] as const

const URGENCY_KEYS = ['Low', 'Medium', 'High', 'Critical'] as const

const validDistrictNames = JHARKHAND_DISTRICTS.map((d) => d.name)

const schema = z.object({
  title: z.string().trim().min(1, 'Problem title is required'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or fewer'),
  category: z.string().min(1, 'Category is required'),
  district: z
    .string()
    .refine((val) => validDistrictNames.includes(val), {
      message: 'Please select a location within Jharkhand.',
    }),
  locality: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  affectedPeople: z.number().min(0, 'Enter zero or a positive number'),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']),
  existingEfforts: z.string().optional(),
  expectedOutcome: z.string().optional(),
  consent: z.boolean().refine(Boolean, 'Consent is required'),
})

type Values = z.infer<typeof schema>

export function SubmitProblemPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { reportProblem, language } = useProblems()

  const t = REPORT_PROBLEM_TRANSLATIONS[language] || REPORT_PROBLEM_TRANSLATIONS.en

  const [files, setFiles] = useState<string[]>([])
  const [createdProblem, setCreatedProblem] = useState<CitizenProblem | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      affectedPeople: 0,
      urgency: 'Medium',
      consent: false,
      description: '',
      district: '',
      locality: '',
      landmark: '',
      existingEfforts: '',
      expectedOutcome: '',
    },
  })

  const description = useWatch({ control, name: 'description', defaultValue: '' })
  const selectedDistrict = useWatch({ control, name: 'district', defaultValue: '' })
  const selectedLocality = useWatch({ control, name: 'locality', defaultValue: '' }) || ''
  const selectedLandmark = useWatch({ control, name: 'landmark', defaultValue: '' }) || ''

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 23.3441,
    lng: 85.3096,
  })

  const handleDistrictSelect = (districtName: string, lat: number, lng: number) => {
    setValue('district', districtName, { shouldValidate: true })
    setCoords({ lat, lng })
  }

  const submit = async (values: Values) => {
    const formattedLocation = `${values.district}, Jharkhand${values.locality ? ` (${values.locality})` : ''}`

    const newProblem = await reportProblem({
      title: values.title,
      description: values.description,
      category: values.category,
      location: formattedLocation,
      state: 'Jharkhand',
      district: values.district,
      locality: values.locality || '',
      landmark: values.landmark || '',
      latitude: coords.lat,
      longitude: coords.lng,
      affectedPeople: values.affectedPeople,
      urgency: values.urgency,
      requiredCapabilities: ['Civic assessment', 'Field survey', 'Public consultation'],
    })

    setCreatedProblem(newProblem)
  }

  return (
    <CitizenLayout title="Report Problem">
      <PageContainer>
        <PageHeader
          title="Report Problem"
          description="Report a verified community challenge in Jharkhand so the right authorities, universities, and partners can collaborate on a deployed solution."
          breadcrumbs={[
            { label: 'Citizen', href: '/citizen/dashboard' },
            { label: 'Report Problem' },
          ]}
        />

        {createdProblem && (
          <TrackIdConfirmationModal
            problem={createdProblem}
            onClose={() => setCreatedProblem(null)}
            translations={t}
          />
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
          {/* Problem Details Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              {t.problemDetailsSectionTitle}
            </h2>
            <div className="mt-5 grid gap-5">
              <FormField
                label={t.problemTitleLabel}
                placeholder={t.problemTitlePlaceholder}
                {...register('title')}
                error={errors.title ? t.problemTitleError : undefined}
                required
              />

              <TextAreaField
                label={t.descriptionLabel}
                placeholder={t.descriptionPlaceholder}
                maxLength={2000}
                {...register('description')}
                error={
                  errors.description
                    ? description.length > 2000
                      ? t.descriptionMaxError
                      : t.descriptionError
                    : undefined
                }
                required
              />
              <p className="-mt-3 text-right text-xs text-slate-400">
                {description.length}/2000 {t.descriptionCharCount}
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label={t.categoryLabel}
                  options={[
                    { label: t.categorySelectPrompt, value: '' },
                    ...CATEGORY_KEYS.map((value) => ({
                      label: t.categories[value] || value,
                      value,
                    })),
                  ]}
                  {...register('category')}
                  error={errors.category ? t.categoryError : undefined}
                  required
                />
                <SelectField
                  label={t.urgencyLabel}
                  options={URGENCY_KEYS.map((value) => ({
                    label: t.urgencyLevels[value] || value,
                    value,
                  }))}
                  {...register('urgency')}
                  error={errors.urgency ? t.urgencyError : undefined}
                  required
                />
              </div>

              <FormField
                label={t.affectedPeopleLabel}
                type="number"
                min="0"
                placeholder={t.affectedPeoplePlaceholder}
                {...register('affectedPeople', { valueAsNumber: true })}
                error={errors.affectedPeople ? t.affectedPeopleError : undefined}
                required
              />
            </div>
          </section>

          {/* Section: Jharkhand Location Restriction & Map Picker */}
          <section>
            <JharkhandMapPicker
              selectedDistrict={selectedDistrict}
              selectedLocality={selectedLocality}
              selectedLandmark={selectedLandmark}
              latitude={coords.lat}
              longitude={coords.lng}
              onDistrictChange={handleDistrictSelect}
              onLocalityChange={(val) => setValue('locality', val)}
              onLandmarkChange={(val) => setValue('landmark', val)}
              onCoordinatesChange={(lat, lng) => setCoords({ lat, lng })}
              error={errors.district ? t.districtError : undefined}
              sectionTitle={t.locationSectionTitle}
              sectionSubtitle={t.locationSectionSubtitle}
              restrictedBadge={t.restrictedJharkhandBadge}
              stateLabel={t.stateLabel}
              districtLabel={t.districtLabel}
              districtPrompt={t.districtSelectPrompt}
              localityLabel={t.localityLabel}
              localityPlaceholder={t.localityPlaceholder}
              landmarkLabel={t.landmarkLabel}
              landmarkPlaceholder={t.landmarkPlaceholder}
              mapTitle={t.mapPrototypeTitle}
              mapHint={t.mapClickHint}
              coordinatesLabel={t.selectedCoordinatesLabel}
            />
          </section>

          {/* Context and Desired Outcome Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              {t.contextSectionTitle}
            </h2>
            <div className="mt-5 grid gap-5">
              <TextAreaField
                label={t.existingEffortsLabel}
                placeholder={t.existingEffortsPlaceholder}
                {...register('existingEfforts')}
              />
              <TextAreaField
                label={t.expectedOutcomeLabel}
                placeholder={t.expectedOutcomePlaceholder}
                {...register('expectedOutcome')}
              />
            </div>
          </section>

          {/* Supporting Files Upload */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              {t.supportingDocsSectionTitle}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {t.supportingDocsSubtitle}
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-center transition hover:border-[#187e8d]">
              <UploadCloud className="text-[#187e8d]" size={28} />
              <span className="mt-2 text-sm font-semibold text-slate-700">
                {t.chooseFilesText}
              </span>
              <span className="mt-1 text-xs text-slate-400">
                {t.uploadHint}
              </span>
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []).map((file) => file.name))
                }
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 text-xs text-slate-600 space-y-1">
                {files.map((file) => (
                  <li key={file} className="flex items-center gap-1.5 font-medium">
                    <span>📄</span> {file}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-slate-600">
            <input
              type="checkbox"
              {...register('consent')}
              className="mt-0.5 size-4 rounded accent-[#12365a]"
            />
            <span>
              {t.consentText}{' '}
              <span className="text-red-600 font-bold">*</span>
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-red-600 font-medium">{t.consentError}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t.cancelButton}
            </button>
            <button
              type="button"
              onClick={() => navigate('/citizen/problems')}
              className="rounded-xl border border-[#12365a] px-5 py-2.5 text-sm font-semibold text-[#12365a] transition hover:bg-slate-50"
            >
              {t.viewReportsButton}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#12365a] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#1a4a7a] disabled:opacity-60 active:scale-95"
            >
              {isSubmitting ? t.submittingButton : t.submitButton}
            </button>
          </div>
          <p className="text-right text-xs text-slate-400">
            {t.reportingAsFooter} {currentUser?.name} · Jharkhand State Innovation System
          </p>
        </form>
      </PageContainer>
    </CitizenLayout>
  )
}

