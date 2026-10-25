import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACM_COLORS } from '@/data/colors'
import { App } from './App'

/** Testes de comportamento: o que o cliente vê e faz. Animações ficam desligadas (setup.ts). */
describe('App', () => {
  // O histórico do jsdom passa de um teste para o outro: cada teste começa numa entrada limpa.
  beforeEach(() => window.history.replaceState(null, ''))
  afterEach(() => {
    // O jsdom não implementa scrollIntoView; alguns testes criam um de mentira.
    delete (Element.prototype as Partial<Element>).scrollIntoView
  })
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
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  })

  it('o "voltar" do navegador ou do celular fecha o detalhe em vez de sair do site', async () => {
    const user = userEvent.setup()
    render(<App />)
    const grid = screen.getByRole('list', { name: 'Cores da cartela' })
    await user.click(within(grid).getByRole('button', { name: 'Azul Royal. Ampliar' }))
    const dialog = screen.getByRole('dialog', { name: 'Azul Royal' })
    expect(dialog).toHaveAttribute('open')

    window.history.back()
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  })

  it('"Ver na fachada" fecha o detalhe, rola até a fachada e troca a cor principal', async () => {
    const user = userEvent.setup()
    // Guarda se o detalhe ainda estava aberto no momento do pedido de rolagem.
    const detailOpenOnScroll: boolean[] = []
    const scrollIntoView = vi.fn<() => void>(() => {
      detailOpenOnScroll.push(document.querySelector('dialog')?.hasAttribute('open') ?? false)
    })
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    render(<App />)
    const grid = screen.getByRole('list', { name: 'Cores da cartela' })
    await user.click(within(grid).getByRole('button', { name: 'Azul Royal. Ampliar' }))
    const dialog = screen.getByRole('dialog', { name: 'Azul Royal' })
    await user.click(within(dialog).getByRole('button', { name: 'Ver na fachada' }))

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('fachada'))
    // Com o detalhe aberto a rolagem da página fica travada: o pedido tem que vir depois.
    expect(detailOpenOnScroll).toEqual([false])
    const [mainRoyal] = screen.getAllByRole('radio', { name: 'Azul Royal' })
    await waitFor(() => expect(mainRoyal).toBeChecked())
  })

  it('no detalhe, o dedo move o reflexo da chapa; com "reduzir movimento", ela não inclina', async () => {
    const user = userEvent.setup()
    render(<App />)
    const grid = screen.getByRole('list', { name: 'Cores da cartela' })
    await user.click(within(grid).getByRole('button', { name: 'Azul Royal. Ampliar' }))

    const dialog = screen.getByRole('dialog', { name: 'Azul Royal' })
    const plate = dialog.querySelector<HTMLElement>('[data-finish]')
    if (!plate) throw new Error('chapa do detalhe não encontrada')
    // O jsdom não calcula tamanhos: a chapa ganha 400 × 250 px para a conta de posição.
    plate.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 250 }) as DOMRect

    fireEvent.pointerDown(plate, { pointerType: 'touch', clientX: 300, clientY: 50 })
    expect(plate).toHaveAttribute('data-live')
    expect(plate.style.getPropertyValue('--mx')).toBe('75.0%')
    expect(plate.style.getPropertyValue('--my')).toBe('20.0%')
    expect(plate.style.getPropertyValue('--rx')).toBe('')

    fireEvent.pointerLeave(plate, { pointerType: 'touch' })
    expect(plate).not.toHaveAttribute('data-live')
  })

  it('"Desfazer sorteio" volta à combinação de antes do sorteio', async () => {
    const user = userEvent.setup()
    render(<App />)
    const undo = screen.getByRole('button', { name: 'Desfazer sorteio' })
    expect(undo).toBeDisabled()
    expect(screen.getByText(/revestimento Dark Grey e pórtico Amarelo Real/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sortear combinação' }))
    expect(undo).toBeEnabled()
    await user.click(undo)
    expect(screen.getByText(/revestimento Dark Grey e pórtico Amarelo Real/)).toBeInTheDocument()
    expect(undo).toBeDisabled()
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
