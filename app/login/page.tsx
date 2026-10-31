// ============================================================
// Nexo Assist — Login Page (Tela 1)
// ============================================================
import LoginForm from "@/components/login/LoginForm";
import Image from "next/image";

export const metadata = {
  title: "Login — Nexo Assist",
};

export default function LoginPage() {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
      {/* Seção Esquerda (Banner / Preview) */}
      <section className="bg-[#1B2430] h-full w-full px-6 sm:px-12 lg:px-16 pt-8 lg:pt-10 pb-10 lg:pb-12 flex flex-col justify-between">
        <div>
          <div className="mb-10 lg:mb-[118.5px]">
            <Image src="/logo.png" alt="Nexo Assist" width={130} height={24} />
          </div>

          <p className="text-[13.5px] font-medium text-white/55 mb-4.5">
            Service desk de TI da nexo
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-regular leading-[110%] lg:leading-[104%] tracking-[-1.2px] text-white font-newsreader mb-4.5">
            Seu problema de TI, resolvido em uma conversa.
          </h1>

          <p className="text-sm sm:text-base font-regular leading-[155%] text-white/65 mb-8 lg:mb-9">
            Descreva o que está acontecendo. O assistente consulta seus
            <br className="hidden lg:inline" /> chamados, busca na central de
            ajuda e chama um analista quando
            <br className="hidden lg:inline" /> precisa.
          </p>

          {/* Card de Simulação do Chat */}
          <div className="flex justify-center items-center mb-12 lg:mb-29.25">
            <div className="max-w-125 w-full bg-white/4 border border-white/8 rounded-2xl p-4 sm:p-4.5">
              <div className="flex justify-end items-end mb-2.5">
                <div className="rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm py-2.25 px-3.5 bg-white">
                  <p className="text-[13.5px] font-regular text-[#1B2430]">
                    Meu notebook não conecta na VPN. Erro 809.
                  </p>
                </div>
              </div>
              <p className="text-white/45 font-regular text-[12.5px] mb-1.5 flex flex-wrap gap-1.5 items-center">
                <span className="text-white/80 font-semibold">Nexo Assist</span>
                consultou seus chamados · criou um chamado
              </p>

              <div className="bg-white/8 py-2.5 px-3.5 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl max-w-full sm:max-w-95 w-full mb-1.5">
                <p className="text-white font-regular text-[13.5px] leading-[150%]">
                  Pronto: abri o chamado com prioridade alta. Um analista
                  <br className="hidden sm:inline" /> fala com você em até 4 h
                  úteis.
                </p>
              </div>

              <div className="bg-white rounded-xl py-1.75 px-3 max-w-full sm:max-w-70 flex items-center gap-2">
                <div className="bg-[#F5A300] w-1.75 h-1.75 rounded-full shrink-0" />
                <p className="text-[12.5px] font-regular text-[#5C6573] flex flex-wrap gap-x-2 items-center">
                  <span className="text-[#1B2430] font-semibold">
                    INC-20517
                  </span>
                  Rede e VPN · Alta · em até 4 h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas / Footer da Seção Esquerda */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-6 border-t border-white/10 pt-6">
          <div className="pb-4 sm:pb-0 sm:pr-6 lg:pr-11.25 border-b sm:border-b-0 sm:border-r border-white/10">
            <h3 className="text-white font-newsreader font-regular tracking-[-0.6px] text-[34px] mb-1.5">
              8 s
            </h3>
            <p className="text-white/55 font-regular text-[13.5px]">
              primeira resposta, em média
            </p>
          </div>

          <div className="pb-4 sm:pb-0 sm:pr-6 lg:pr-11.25 border-b sm:border-b-0 sm:border-r border-white/10">
            <h3 className="text-white font-newsreader font-regular tracking-[-0.6px] text-[34px] mb-1.5">
              72%
            </h3>
            <p className="text-white/55 font-regular text-[13.5px]">
              resolvidos sem fila
            </p>
          </div>

          <div>
            <h3 className="text-white font-newsreader font-regular tracking-[-0.6px] text-[34px] mb-1.5 flex items-center gap-2">
              6 <span className="w-2 h-2 bg-[#00BD6B] rounded-full" />
            </h3>
            <p className="text-white/55 font-regular text-[13.5px]">
              analistas online agora
            </p>
          </div>
        </div>
      </section>

      {/* Seção Direita (Formulário de Login) */}
      <section className="bg-white w-full px-6 sm:px-12 lg:px-14 pt-8 lg:pt-10 pb-10 flex flex-col min-h-screen lg:min-h-0">
        <div className="flex justify-end items-end mb-12 lg:mb-45">
          <p className="text-[13.5px] font-regular text-[#5C6573] flex flex-wrap gap-1.5">
            Problema para entrar?
            <a className="text-[#006AC7] font-semibold hover:underline cursor-pointer">
              Ligue no ramal 4000
            </a>
          </p>
        </div>

        <div className="my-auto">
          <LoginForm />
        </div>

        <footer className="flex flex-col sm:flex-row gap-4 justify-between items-center sm:items-end w-full mt-12 lg:mt-auto pt-6">
          <p className="text-[12.5px] font-regular text-[#5C6573]">
            &copy; 2026 Nexo · Service desk de TI
          </p>
          <a
            href="#"
            className="text-[12.5px] font-regular text-[#5C6573] hover:underline"
          >
            Privacidade e uso de dados
          </a>
        </footer>
      </section>
    </main>
  );
}
