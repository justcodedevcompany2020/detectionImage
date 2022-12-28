import React, { useState, useEffect, useRef } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import {
    CameraDeviceFormat,
    CameraRuntimeError,
    FrameProcessorPerformanceSuggestion,
    PhotoFile,
    sortFormats,
    useCameraDevices,
    useFrameProcessor,
    VideoFile,
    Camera
} from 'react-native-vision-camera';

import ImgToBase64 from 'react-native-image-base64';

const LoadingView = () => {
    return (
        <View>
            <Text style={{color:'white'}}>Load camera</Text>
        </View>
    )
}
const App = () => {

    const camera = useRef(null)
    const [camera_permission, setCameraPermission] = useState(false);
    const [recognition_data, setRecognitionData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect( () => {
        (async () => {

            const cameraPermission = await Camera.getCameraPermissionStatus()
            if(cameraPermission == 'denied') {
                const newCameraPermission = await Camera.requestCameraPermission()
                setCameraPermission(newCameraPermission)
            }

        })();

    }, [camera_permission]);

    const identifyImage =  (imageData = '') =>
    {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Key 6249eefe8c2b4944b9d285c5595bb466");
        myHeaders.append("Content-Type", "text/plain");

        const raw = JSON.stringify({
            "inputs": [
                {
                    "data": {
                        "image": {
                            "base64": imageData
                        }
                    }
                }
            ]
        });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("https://api.clarifai.com/v2/users/artyom_appdeveloper/apps/detecter_for_test/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs", requestOptions)
            .then(response => response.json())
            .then(result => {
                let data = result.outputs[0].data.concepts;
                data.sort(function(a, b) {
                    return a.value + b.value;
                })
                setRecognitionData(data);

                getPrice(data)
            })
            .catch(error => console.log('error', error));


    }
    const takePhoto = async () =>
    {
        setLoading(true);
        const photo = await camera.current.takePhoto({
            flash: 'on',
        })
        ImgToBase64.getBase64String('file://'+photo.path)
        .then(base64String => {
            identifyImage(base64String)
        })
        .catch(err => {
            setLoading(false);
            console.log( err)
        });
    }


    const getPrice = async (recognitions) =>
    {

        let text = '';
        let recognitions_length = recognitions.length -1;

        for (const [index, recognitions_item] of recognitions.entries()) {
            text += index == recognitions_length ?  recognitions_item.name : `${ recognitions_item.name}, ` ;
        }
        console.log(text)
        var myHeaders = new Headers();
        var raw = JSON.stringify({
            "text":text
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("https://my.gocashpro.com/api/get-price", requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                alert(result.text)
                setLoading(false);

            })
            .catch(error => console.log('error', error));
    }
    const devices = useCameraDevices('wide-angle-camera')
    const device = devices.back

    if (device == null) return <LoadingView />
    return (
      <View>
          <Camera
              ref={camera}
              style={styles.camera}
              device={device}
              isActive={true}
              photo={true}
          />

          {loading &&
            <ActivityIndicator style={styles.loader}/>
          }

          {!loading &&
              <TouchableOpacity style={styles.take_photo} onPress={() => {takePhoto()}}>
                  <Text style={{color: 'black'}}>Снять</Text>
              </TouchableOpacity>
          }


      </View>
    )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
    camera: {
         width:'100%',
        height: '100%',
        backgroundColor:'red',
        borderColor:'red',
        borderWidth:2
    },
    take_photo: {
      position:'absolute',
        zIndex: 2,
        bottom: 20,
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 50,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
  },
    loader: {
      position:'absolute',
        zIndex: 2,
        bottom: 20,
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 50,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
  }
});

export default App;
