import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react';
import moment from 'moment';

export default function App() {

  const [dateHistory, setDateHistory] = useState({})//salvar o obj com historico
  const [isBiometricSuported, setIsBiometricSuported] = useState(false)//salvar a referencia de suporte a biometria
  const [authenticated, setAuthenticated] = useState(false)//salvar a referencia de suporte a biometria

  async function CheckExistAuthentications() {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    //Salvando o status de compatibilidade com a biometria
    setIsBiometricSuported(compatible)
  }

  //Recebe o historico da ultima autenticacao
  async function SetHistory(){
    const objAuth = {
      dataAuthentication : moment().format('DD/MM/YYYY HH:mm:ss')
    }

    await AsyncStorage.setItem('authenticate', JSON.stringify(objAuth))

    setDateHistory(objAuth)
  }

  //Recebe o historico da ultima autenticacao
  async function GetHistory(){
    const objAuth = await AsyncStorage.getItem('authenticate');

    if (objAuth) {
      setDateHistory(JSON.parse(objAuth))
    }
  }

  async function handleAuthentication() {
    //Verificar se existe uma biometria cadastrada
    const biometricExist = await LocalAuthentication.isEnrolledAsync();

    if (!biometricExist) {
      return Alert.alert(
        'Falha ao logar',
        'Não foi encontrada nenhuma biometria cadastrada'
      )
    }

    //Caso exista --->
    const auth = await LocalAuthentication.authenticateAsync();

    setAuthenticated(auth.success)

    //verificar se esta autenticado e salvar a data atual
    if (auth.success) {
      SetHistory();
    }
  }

  useEffect(() => {
    CheckExistAuthentications();

    GetHistory()//buscando a ultima autenticacao
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {
          isBiometricSuported
            ? 'Seu dispositivo é compatível com a biometria'
            : 'O seu dispositivo não suporta a biometria / Face id'
        }
      </Text>

      <TouchableOpacity style={styles.btnAuth} onPress={() => handleAuthentication()}>
        <Text style={styles.txtAuth}>Autenticar acesso</Text>
      </TouchableOpacity>

      <Text style={[styles.txtReturn, {color : authenticated ? 'green' : 'red'}]}>
        {
          authenticated
            ? 'Autenticado'
            : 'Não autenticado'
        }
      </Text>

      {
        dateHistory.dataAuthentication
        ? <Text style={styles.txtHistory}>
          Último acesso em {dateHistory.dataAuthentication}
        </Text>
        : null
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    width: '70%',
    textAlign: 'center',
    lineHeight: 30
  },
  btnAuth: {
    padding: 16,
    borderRadius: 10,
    margin: 20,
    backgroundColor: '#ff8800'
  },
  txtAuth: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  txtReturn : {
    fontSize : 22,
    marginTop : 50
  },
  txtHistory : {
    fontSize : 16,
    fontWeight : 'bold',
    color : '#858383',
    position : 'absolute',
    bottom : 120
  }
});
