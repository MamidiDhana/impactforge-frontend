import { useState } from 'react'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { PartnerProfileForm } from '../../components/partner/PartnerProfileForm'
import { partnerOrganization as defaultOrg } from '../../data/partnerOrganization'
import type { PartnerProfile } from '../../types'

export function PartnerProfilePage() {
  const [profile, setProfile] = useState<PartnerProfile>(defaultOrg)

  const handleSaveProfile = (updatedProfile: PartnerProfile) => {
    setProfile(updatedProfile)
  }

  return (
    <PartnerLayout title="Profile">
      <PartnerPage
        title="Profile"
        description="Maintain your organizational identity, capabilities, and resource offerings for accurate project matching."
        breadcrumbs={[
          { label: 'Industry Partnerships', href: '/partner/dashboard' },
          { label: 'Profile' },
        ]}
      >
        <div className="max-w-4xl">
          <PartnerProfileForm
            profile={profile}
            onSave={handleSaveProfile}
          />
        </div>
      </PartnerPage>
    </PartnerLayout>
  )
}