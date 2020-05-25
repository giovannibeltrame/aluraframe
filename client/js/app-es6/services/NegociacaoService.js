import {HttpService} from './HttpService';
import {ConnectionFactory} from './ConnectionFactory';
import {NegociacaoDao} from '../dao/NegociacaoDao';
import {Negociacao} from '../models/Negociacao';

export class NegociacaoService {

    constructor() {

        this._http = new HttpService();
    }

    importa(listaAtual) {
        return this.obterNegociacoes()
        .then(negociacoes => negociacoes.filter(negociacao => 
            !listaAtual.some(negociacaoExistente =>
                JSON.stringify(negociacao) == JSON.stringify(negociacaoExistente))))
        .catch(error => {
            console.error(error);
            throw new Error('Não foi possível buscar negociaçoes para importar.');
        });
    }

    cadastra(negociacao) {
        return ConnectionFactory
        .getConnection()
        .then(connection => new NegociacaoDao(connection))
        .then(dao => dao.adiciona(negociacao))
        .then(() => 'Negociação adicionada com sucesso.')
        .catch(() => {
            console.error(error);
            throw new Error('Não foi possível adicionar a negociação.');
        });
    }

    lista() {
        return ConnectionFactory
        .getConnection()
        .then(connection => new NegociacaoDao(connection))
        .then(dao => dao.listaTodos())
        .catch(error => {
            console.error(error);
            throw new Error('Não foi possível obter as negociações.')
        });
    }

    apaga() {
        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.apagaTodos())
            .then(() => 'Negociações apagadas com sucesso')
            .catch(error => {
                console.error(error);
                throw new Error('Não foi possível apagar as negociações.');
            })
    }

    obterNegociacoes() {

        return Promise.all([
            this.obterNegociacoesDaSemana(),
            this.obterNegociacoesDaSemanaAnterior(),
            this.obterNegociacoesDaSemanaRetrasada()
        ]).then(periodos => {

            let negociacoes = periodos
                .reduce((dados, periodo) => dados.concat(periodo), []);

            return negociacoes;

        }).catch(erro => {
            throw new Error(erro);
        });

    } 

    obterNegociacoesDaSemana() {


        return this._http
            .get('negociacoes/semana')
            .then(negociacoes => {
                return negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor));
            })
            .catch(erro => {
                console.error(erro);
                throw new Error('Não foi possível obter as negociações da semana');
            });  
    }

    obterNegociacoesDaSemanaAnterior() {


        return this._http
            .get('negociacoes/anterior')
            .then(negociacoes => {
                return negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor));
            })
            .catch(erro => {
                console.error(erro);
                throw new Error('Não foi possível obter as negociações da semana anterior');
            });  
    }

    obterNegociacoesDaSemanaRetrasada() {


        return this._http
            .get('negociacoes/retrasada')
            .then(negociacoes => {
                return negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor));
            })
            .catch(erro => {
                console.error(erro);
                throw new Error('Não foi possível obter as negociações da semana retrasada');
            });  

    }
}