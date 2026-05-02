#!/usr/bin/env node

import { intro, outro, text, confirm, spinner, note, cancel, isCancel } from '@clack/prompts'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import pc from 'picocolors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = path.resolve(__dirname, '../../template')

async function main() {
  console.log()
  console.log(pc.bold(pc.green('  ╭──────────────────────────────╮')))
  console.log(pc.bold(pc.green('  │         create-zuri          │')))
  console.log(pc.bold(pc.green('  │  Paystack · Supabase · Next  │')))
  console.log(pc.bold(pc.green('  ╰──────────────────────────────╯')))
  console.log()

  intro(pc.bold(' Setting up your storefront '))

  const projectName = await text({
    message: 'Project directory name',
    placeholder: 'my-store',
    validate: (v) => {
      if (!v.trim()) return 'Required'
      if (!/^[a-zA-Z0-9-_]+$/.test(v.trim())) return 'Use only letters, numbers, hyphens, or underscores'
    },
  })
  if (isCancel(projectName)) { cancel('Cancelled'); process.exit(0) }

  const storeName = await text({
    message: 'Store name (shown in the navbar and browser tab)',
    placeholder: 'My Store',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(storeName)) { cancel('Cancelled'); process.exit(0) }

  const currencySymbol = await text({
    message: 'Currency symbol',
    placeholder: '₦',
    initialValue: '₦',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(currencySymbol)) { cancel('Cancelled'); process.exit(0) }

  const whatsappNumber = await text({
    message: 'WhatsApp number for orders (country code + number, no spaces or +)',
    placeholder: '2349000000000',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(whatsappNumber)) { cancel('Cancelled'); process.exit(0) }

  console.log()
  note(
    'Find these in your Supabase project: Settings → API',
    pc.dim('Supabase credentials')
  )

  const supabaseUrl = await text({
    message: 'Supabase project URL',
    placeholder: 'https://xxxx.supabase.co',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(supabaseUrl)) { cancel('Cancelled'); process.exit(0) }

  const supabaseAnonKey = await text({
    message: 'Supabase anon key',
    placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(supabaseAnonKey)) { cancel('Cancelled'); process.exit(0) }

  console.log()
  note(
    'Find these in your Paystack dashboard: Settings → API Keys & Webhooks',
    pc.dim('Paystack credentials')
  )

  const paystackPublicKey = await text({
    message: 'Paystack public key',
    placeholder: 'pk_live_...',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(paystackPublicKey)) { cancel('Cancelled'); process.exit(0) }

  const paystackSecretKey = await text({
    message: 'Paystack secret key',
    placeholder: 'sk_live_...',
    validate: (v) => { if (!v.trim()) return 'Required' },
  })
  if (isCancel(paystackSecretKey)) { cancel('Cancelled'); process.exit(0) }

  console.log()

  const runInstall = await confirm({
    message: 'Run npm install now?',
    initialValue: true,
  })
  if (isCancel(runInstall)) { cancel('Cancelled'); process.exit(0) }

  const targetDir = path.resolve(process.cwd(), projectName.trim())

  if (fs.existsSync(targetDir)) {
    cancel(`Directory "${projectName.trim()}" already exists. Choose a different name or delete it first.`)
    process.exit(1)
  }

  const s = spinner()
  s.start('Scaffolding project...')

  await fs.copy(TEMPLATE_DIR, targetDir, {
    filter: (src) => !src.includes('node_modules') && !src.includes('.next'),
  })

  // Rename gitignore (npm strips .gitignore on publish)
  const gitignoreSrc = path.join(targetDir, 'gitignore')
  const gitignoreDst = path.join(targetDir, '.gitignore')
  if (fs.existsSync(gitignoreSrc)) {
    await fs.rename(gitignoreSrc, gitignoreDst)
  }

  const envContent = [
    `NEXT_PUBLIC_STORE_NAME=${storeName.trim()}`,
    `NEXT_PUBLIC_CURRENCY_SYMBOL=${currencySymbol.trim()}`,
    `NEXT_PUBLIC_WHATSAPP_NUMBER=${whatsappNumber.trim()}`,
    ``,
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}`,
    ``,
    `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=${paystackPublicKey.trim()}`,
    `PAYSTACK_SECRET_KEY=${paystackSecretKey.trim()}`,
  ].join('\n')

  await fs.writeFile(path.join(targetDir, '.env.local'), envContent)

  s.stop('Project scaffolded!')

  if (runInstall) {
    const s2 = spinner()
    s2.start('Installing dependencies...')
    try {
      execSync('npm install', { cwd: targetDir, stdio: 'pipe' })
      s2.stop('Dependencies installed!')
    } catch {
      s2.stop(pc.yellow('npm install failed — run it manually in the project folder.'))
    }
  }

  note(
    [
      `  1.  cd ${projectName.trim()}`,
      ``,
      `  2.  Run the SQL in supabase/schema.sql in your`,
      `      Supabase dashboard → SQL Editor`,
      ``,
      `  3.  Create a storage bucket named "product-images"`,
      `      in Supabase Storage and set it to public`,
      ``,
      `  4.  Create an admin user in Supabase → Authentication`,
      ``,
      `  5.  npm run dev`,
      ``,
      `      Storefront → http://localhost:3000`,
      `      Admin      → http://localhost:3000/admin`,
    ].join('\n'),
    'Next steps'
  )

  outro(pc.bold(pc.green(`You're ready. Go build ${storeName.trim()}.`)))
}

main().catch((err) => {
  console.error(pc.red('Something went wrong:'), err.message)
  process.exit(1)
})
