import { useFilePicker } from 'use-file-picker';
import React from 'react';
import SegmentPicker from './Components/SegmentPicker';
import Chart from './Components/Chart'
import RangeSlider from 'react-range-slider-input';
import { parseEvents } from './Parser.js'
import { segmentLogsByType } from './Segmenter.js'
import { PrecisionPicker } from './Components/PrecisionPicker';
import { PRECISION_MAP } from './Constants';
import './App.css';
import { formatSeconds } from './util';
import Header from './Header.svg'
import LoadingSVG from './Loading.svg'

function App() {
  const [segmentIndex, setSegmentIndex] = React.useState(0)
  const [range, setRange] = React.useState([0,9999])
  const [precision, setPrecision] = React.useState('high')
  const [useStub, setUseStub] = React.useState(false)
  const [stub, setStub] = React.useState('')
  const [eventsCache, setEventsCache] = React.useState([])
  const [logSegments, setLogSegments] = React.useState()
  const [waitForLoading, setWaitForLoading] = React.useState(false)
  const [loadingStub, setLoadingStub] = React.useState(false)
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    onFilesSelected: (data) => {
      setUseStub(false)
      setWaitForLoading(true)
      if(data.filesContent[0]) {
        handleNewLog(data.filesContent[0].content)
      }
      setTimeout(() => setWaitForLoading(false), 1500)
    },
    accept: '.txt',
  });

  const loadStub = async () => {
    if(useStub) {
      return
    }
    if(!stub) {
      setLoadingStub(true)
      setWaitForLoading(true)
      const res = await fetch('/Damage-Chart/StubLog.txt')
      const data = await res.text()
      setStub(data)
      setLoadingStub(false)
      handleNewLog(data)
      setTimeout(() => setWaitForLoading(false), 1500)
    } else {
      await handleNewLog(stub)
    }
    setUseStub(true)
  }
  const handleSegmentChange = (sIndex) => {
    const rawText = useStub ? stub : filesContent[0].content
    if (!eventsCache[sIndex]) {
      const segments = [...segmentLogsByType(rawText, 'arena'), ...segmentLogsByType(rawText, 'dungeon')]
      const segmentLines = rawText.slice(segments[sIndex].startIndex, segments[sIndex].endIndex)
      const logSegment = segments[sIndex]
      const filterDamageNotDoneToPlayers = logSegment.type === 'arena' ? true : false
      const newEventsCache = [...eventsCache]
      newEventsCache[sIndex] = parseEvents(segmentLines, filterDamageNotDoneToPlayers)
      setEventsCache(newEventsCache)
    }
    setSegmentIndex(sIndex)
  }

  const handleNewLog = (rawText) => {
    setSegmentIndex(0)
    setEventsCache([])
    const segments = [...segmentLogsByType(rawText, 'arena'), ...segmentLogsByType(rawText, 'dungeon')]
    const segmentLines = rawText.slice(segments[0].startIndex, segments[0].endIndex)
    const logSegment = segments[0]
    const filterDamageNotDoneToPlayers = logSegment.type === 'arena' ? true : false
    const newEventsCache = []
    newEventsCache[0] = parseEvents(segmentLines, filterDamageNotDoneToPlayers)
    setEventsCache(newEventsCache)
    setLogSegments(segments)
  }


  if (waitForLoading) {
    return <div className="App">
      <img className="LoadingSpinner" src={LoadingSVG} />
    </div>;
  }
  if (eventsCache[segmentIndex] && logSegments) {
    const { filteredBinnedEvents, players } = eventsCache[segmentIndex]

    const binnedDataBySeconds = binFinalizedDataBySeconds(filteredBinnedEvents, PRECISION_MAP[precision])
    const finalizedData = fillInactiveTime(binnedDataBySeconds, players)
    const dataWindow = finalizedData.slice(range[0], range[1])
    return (
      <div className="App">
        <header className="App-header">
          <img src={Header} />
        </header>
        <SegmentPicker activeSegment={segmentIndex} segments={logSegments} onButtonClick={handleSegmentChange} setRange={setRange}/>
            <button className="SelectCombatLogButton" onClick={() => openFileSelector()}>Select Combat Log </button>
            <button className="AddExampleDataButton" onClick={() => loadStub()}> Try Example Data! </button>
            <a className="SeeExampleDataButton" href="https://asopha.github.io/Damage-Chart/StubLog.txt" target="_blank"> See Example Data</a>
          <div className="ChartAndControls" >
            <Chart data={dataWindow} players={players}/>
            <div className="ControlsWrapper">
              <RangeSlider min={0} max={finalizedData.length} value={range} onInput={setRange}/>
              <PrecisionPicker value={precision} onChange={setPrecision} setRange={setRange}/>
            </div>
          </div>
      </div>
    );
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={Header} />
      </header>
      <div>
        <button className="SelectCombatLogButton" onClick={() => {openFileSelector()}}>Select Combat Log </button>
        <button className="AddExampleDataButton" onClick={() => loadStub()}> Try Example Data! </button>
        <br />
      </div>
    </div>
  );
}

export default App;

const binFinalizedDataBySeconds = (finalizedData, seconds) => {
  if (seconds === 1) {
    return finalizedData
  }
  const result = []
  
  let currentTime = 0;
  let accumulatedDamage = {time: currentTime}
  for (const timeSlice of finalizedData) {
    if (timeSlice.time > (currentTime + seconds)) {
      result.push(accumulatedDamage)
      currentTime += seconds
      const formattedTime = formatSeconds(currentTime)
      accumulatedDamage = {time: currentTime, formattedTime}
    }
    if(timeSlice.time < (currentTime + seconds)) {
      for (const player in timeSlice) {
        if (player === 'time') {
          accumulatedDamage.time = currentTime
          accumulatedDamage.formattedTime = formatSeconds(currentTime)
        } else if (player!== 'formattedTime'){
          if (!accumulatedDamage[player]) {
            accumulatedDamage[player] = Math.floor(timeSlice[player]/seconds)
          } else {
            accumulatedDamage[player] += Math.floor(timeSlice[player]/seconds)
          }
        }
      } 
    }
  }
  return result
}

const fillInactiveTime = (binnedPlayerEvents, players) => {
  const playerNames = getPlayerNamesFromPlayersList(players)
  
  const filledEvents = binnedPlayerEvents.map((binnedEvent) => {
    const filledEvent = {...binnedEvent}
    for (const playerName of playerNames) {
      if(!binnedEvent[playerName]) {
        filledEvent[playerName] = 0
      }
    }
    return filledEvent
  })
  return filledEvents
}

const getPlayerNamesFromPlayersList = (players) => {
  const playerNames = []
  const playerIterator = players.values();
  for (let i = 0; i < players.size; i++) {
    playerNames.push(playerIterator.next().value.name)
  }
  return playerNames
}


