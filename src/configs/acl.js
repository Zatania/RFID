import { AbilityBuilder, Ability } from '@casl/ability'

export const AppAbility = Ability

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role, subject) => {
  const { can, rules } = new AbilityBuilder(AppAbility)
  if (role === 'super_admin') {
    can('manage', 'all')
  } else if (role === 'admin') {
    can(['read'], 'home')
    can(['read'], 'user-management')
    can(['read'], 'premium-management')
  } else if (role === 'bao') {
    can(['read'], 'home')
    can(['read'], 'dashboard')
    can(['read'], 'user-logs')
  } else if (role === 'security_guard') {
    can(['read'], 'home')
    can(['read'], 'visitor-management')
    can(['read'], 'dashboard')
    can(['read'], 'user-logs')
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
