import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ACM_COLORS } from '@/data/colors'
import { App } from './App'

/** Testes de comportamento: o que o cliente vê e faz. Animações ficam desligadas (setup.ts). */
describe('App', () => {
  it('mostra o título, a cartela completa e os seletores da fachada', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cartela de cores ACM' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: `As ${ACM_COLORS.length} cores` }),
    ).toBeInTheDocument()
    const grid = screen.getByRole('list', { name: 'Cores da cartela' })
    expect(within(grid).getAllByRole('listitem')).toHaveLength(ACM_COLORS.length)
    expect(screen.getAllByRole('radio', { name: 'Azul Royal' })).toHaveLength(2)
  })

  it('filtra a cartela por família', async () => {
    const user = userEvent.setup()
    render(<App />)
    const grid = screen.getByRole('list', { name: 'Cores da cartela' })
    await user.click(screen.getByRole('button', { name: /^Azuis/ }))

    expect(screen.getByRole('button', { name: /^Azuis/ })).toHaveAttribute('aria-pressed', 'true')
    const visible = within(grid).getAllByRole('listitem')
    expect(visible).toHaveLength(ACM_COLORS.filter((c) => c.family === 'azuis').length)
  })

  it('abre o detalhe da cor, navega para a próxima e fecha', async () => {
    const user = userEvent.setup()
    render(<App />)
    const grid = screen.getByRole('list', { name: 'Cores da cartela' })
    await user.click(within(grid).getByRole('button', { name: 'Azul Royal. Ampliar' }))

    const dialog = screen.getByRole('dialog', { name: 'Azul Royal' })
    expect(dialog).toHaveAttribute('open')

    await user.click(within(dialog).getByRole('button', { name: 'Próxima cor' }))
    const next = ACM_COLORS[ACM_COLORS.findIndex((c) => c.id === 'azul-royal') + 1]
    expect(within(dialog).getByRole('heading', { name: next?.name })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /Fechar/ }))
    expect(dialog).not.toHaveAttribute('open')
  })

  it('troca a cor principal da fachada', async () => {
    const user = userEvent.setup()
    render(<App />)
    const [mainRoyal] = screen.getAllByRole('radio', { name: 'Azul Royal' })
    await user.click(mainRoyal!)
    expect(mainRoyal).toBeChecked()
    expect(screen.getByText(/revestimento Azul Royal/)).toBeInTheDocument()
  })
})
