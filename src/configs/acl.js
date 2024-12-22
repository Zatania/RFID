import { AbilityBuilder, Ability } from '@casl/ability'

export const AppAbility = Ability

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role, subject) => {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility)
  if (role === 'super_admin') {
    can('manage', 'all')
    cannot('read', 'profile-page')
    cannot(['read'], 'user-management')
    cannot(['read'], 'premium-management')
    cannot(['read'], 'bao-activation')
    cannot(['read'], 'bao-topup')
    cannot(['read'], 'visitor-management')
    cannot(['read'], 'dashboard')
  } else if (role === 'admin') {
    can(['read'], 'home')
    can(['read'], 'user-management')
    can(['read'], 'premium-management')
    can(['read'], 'logs')
    can(['read'], 'total_users')
    can(['read'], 'total_staffs')
    can(['read'], 'total_premiums')
    can(['read'], 'total_scans')
  } else if (role === 'bao') {
    can(['read'], 'home')
    can(['read'], 'bao-activation')
    can(['read'], 'bao-topup')
    can(['read'], 'topup-history')
    can(['read'], 'violations')
    can(['read'], 'total_users')
    can(['read'], 'total_staffs')
    can(['read'], 'total_premiums')
    can(['read'], 'total_violations')
  } else if (role === 'security_guard') {
    can(['read'], 'home')
    can(['read'], 'visitor-management')
    can(['read'], 'dashboard')
    can(['read'], 'logs')
    can(['read'], 'parking-logs')
    can(['read'], 'parking-monitoring')
    can(['read'], 'total_visitors')
    can(['read'], 'total_scans')
  } else if (role === 'user') {
    can(['read'], 'profile-page')
  } else if (role === 'premium') {
    can(['read'], 'profile-page')
  } else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role, subject) => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object.type
  })
}

export const defaultACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
