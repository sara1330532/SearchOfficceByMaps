import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Form from './Form'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { Marker, Popup } from 'react-leaflet';


function App() {

  
  return (
    <>
      <Form/>
    </>
  )
}

export default App