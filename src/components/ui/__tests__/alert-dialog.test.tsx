import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction
} from "../alert-dialog"

describe("AlertDialog", () => {
  it("abre e exibe conteúdo do AlertDialog ao clicar no trigger", async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Título</AlertDialogTitle>
          <AlertDialogDescription>Descrição</AlertDialogDescription>
          <AlertDialogAction>Ok</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    )

    // Antes de abrir, o conteúdo não deve estar na tela
    expect(screen.queryByText("Título")).not.toBeInTheDocument()
    expect(screen.queryByText("Descrição")).not.toBeInTheDocument()

    // Clica para abrir
    await user.click(screen.getByText("Open"))

    // Agora o conteúdo deve aparecer
    expect(screen.getByText("Título")).toBeInTheDocument()
    expect(screen.getByText("Descrição")).toBeInTheDocument()
    expect(screen.getByText("Ok")).toBeInTheDocument()
  })
})
