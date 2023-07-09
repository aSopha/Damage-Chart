import { PureComponent } from 'react';
import { STROKE_LIST } from '../Constants';
import { ResponsiveContainer, LineChart, Line, Legend, XAxis, YAxis, Tooltip } from 'recharts';
class Chart extends PureComponent {
  render() {
    const players = addStrokesToPlayers(this.props.players)
    const data = this.props.data
    const xStartDomain = data.length > 0 ? data[0].time : 0
    const xEndDomain = data.length > 0 ? data[data.length-1].time : 0
    const yDomain = data.length > 0 ? 'auto' : [0,10000]
    return (
      <div className="Chart">
        <ResponsiveContainer width={"100%"} height="100%">
        <LineChart data={data}
            margin={{ top: 100, right: 100, left: 100, bottom: 100 }}>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" align="center" verticalAlign="bottom" height={36}/>
            {Array.from(players, ([name, value]) => value).map((player, index) => {
              if(player.strokeArray) {
                return <Line key={index} type="monotone" dataKey={player.name} stroke={player.color} strokeWidth={3} dot={false} strokeDasharray={player.strokeArray}/>
              }
              return <Line key={index} type="monotone" dataKey={player.name} stroke={player.color} strokeWidth={3} dot={false}/>
            })}
            <XAxis type="number" dataKey="time" domain={[xStartDomain, xEndDomain]} stroke="White"/>
            <YAxis type="number" stroke="White" domain={yDomain}/>
        </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const addStrokesToPlayers = (players) => {
  const playersWithStrokes = new Map(players);
  const classCount = {}
  for (const [player, data] of playersWithStrokes.entries()) {
    const playerClass = data.class
    let strokeArray;
    if (!classCount[playerClass]) {
      classCount[playerClass] = 1
    } else {
      strokeArray = STROKE_LIST[classCount[playerClass]]
      classCount[playerClass]++
    }
    playersWithStrokes.set(player, {...data, strokeArray: strokeArray})
  }
  return playersWithStrokes
}
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="Tooltip">
        {payload.map((player, index) => {
          return <p key={index} className="label" style={{ color: `${player.color}`}}>{`${player.dataKey} : ${player.value.toLocaleString(navigator.language)}`}</p>
        })}
      </div>
    );
  }
return null;
};
export default Chart