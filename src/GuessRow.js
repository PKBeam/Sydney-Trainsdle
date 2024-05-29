function GuessRow({ guess, correct }) {
  let correctLines = guess.lines.filter(value => correct.lines.includes(value)).length;
  let linesColour = correctLines === 0 ? "red" : (correctLines === correct.lines.length && correctLines === guess.lines.length) ? "green" : "orange"

  return (
    <tr>
      <td>
        {guess.name === correct.name ? "✅" : "❌"}
      </td>
      <td>
          {guess.name}
      </td>
      <td style={{"--bs-table-bg-type": linesColour}}>
        {guess.lines.map((line, i) =>
            <img key={i} className="m-1" src={"/TfNSW_"+line+".svg"} alt={line} width="30px"/>
        )}
      </td>
      <td>
        <div className="d-flex" style={{alignItems: "center"}}>
          <div style={{width: "100%"}}>
            {guess.platforms}
          </div>
          <div style={{width: "2em"}}>
            {guess.platforms === correct.platforms ? "✅" : guess.platforms < correct.platforms ? "▲" : "▼"}
          </div>
        </div>
      </td>
      <td>
        <div className="d-flex" style={{alignItems: "center"}}>
          <div style={{width: "100%"}}>
            {guess.dist} km
          </div>
          <div style={{width: "2em"}}>
            {guess.dist === correct.dist ? "✅" : guess.dist < correct.dist ? "▲" : "▼"}
          </div>
        </div>
      </td>
      <td>
        <div className="d-flex" style={{alignItems: "center"}}>
          <div style={{width: "100%"}}>
            {guess.usage}
          </div>
          <div style={{width: "2em"}}>
            {guess.usage === correct.usage ? "✅" : guess.usage < correct.usage ? "▲" : "▼"}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default GuessRow;
