package agendamento.br.dockflow.model;

import jakarta.persistence.*;

// O Lombok gera automaticamente Getters, Setters e Construtores por baixo dos panos
@Entity
@Table(name = "tb_agendamentos")

public class Agendamento {

    @Id
    @Column(name = "protocolo", length = 20, nullable = false, unique = true)
    private String protocolo;

    @Column(length = 50, nullable = false)
    private String status;

    @Column(length = 100)
    private String transportadora;

    @Column(length = 100, nullable = false)
    private String fornecedor;

    @Column(length = 100, nullable = false)
    private String motorista;

    @Column(length = 20, nullable = false)
    private String telefone;

    @Column(length = 100)
    private String email;

    @Column(name = "placa_veiculo", length = 10, nullable = false)
    private String placaVeiculo;

    @Column(name = "tipo_veiculo", length = 50)
    private String tipoVeiculo;

    @Column(nullable = false)
    private String data;

    @Column(length = 10, nullable = false)
    private String horario;

    @Column(name = "tipo_carga", length = 50)
    private String tipoCarga;

    @Column(length = 20)
    private String peso;

    @Column(length = 20)
    private String volume;

    @Column(length = 50)
    private String pedido;

    @Column(name = "nota_fiscal", length = 50)
    private String notaFiscal;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "motivo_cancelamento", columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Column(name = "obs_cancelamento", columnDefinition = "TEXT")
    private String obsCancelamento;

    @Column(name = "arquivo_nf", columnDefinition = "TEXT")
    private String arquivoNF;

    // GETTERS END SETTERS

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransportadora() {
        return transportadora;
    }

    public void setTransportadora(String transportadora) {
        this.transportadora = transportadora;
    }

    public String getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(String fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getMotorista() {
        return motorista;
    }

    public void setMotorista(String motorista) {
        this.motorista = motorista;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPlacaVeiculo() {
        return placaVeiculo;
    }

    public void setPlacaVeiculo(String placaVeiculo) {
        this.placaVeiculo = placaVeiculo;
    }

    public String getTipoVeiculo() {
        return tipoVeiculo;
    }

    public void setTipoVeiculo(String tipoVeiculo) {
        this.tipoVeiculo = tipoVeiculo;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getTipoCarga() {
        return tipoCarga;
    }

    public void setTipoCarga(String tipoCarga) {
        this.tipoCarga = tipoCarga;
    }

    public String getPeso() {
        return peso;
    }

    public void setPeso(String peso) {
        this.peso = peso;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public String getPedido() {
        return pedido;
    }

    public void setPedido(String pedido) {
        this.pedido = pedido;
    }

    public String getNotaFiscal() {
        return notaFiscal;
    }

    public void setNotaFiscal(String notaFiscal) {
        this.notaFiscal = notaFiscal;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public String getObsCancelamento() {
        return obsCancelamento;
    }

    public void setObsCancelamento(String obsCancelamento) {
        this.obsCancelamento = obsCancelamento;
    }

    public String getArquivoNF() {
        return arquivoNF;
    }

    public void setArquivoNF(String arquivoNF) {
        this.arquivoNF = arquivoNF;
    }
}
