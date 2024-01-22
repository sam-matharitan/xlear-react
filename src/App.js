import { useState } from "react";
import './App.css';

function Square({ value, styleCt, onSquareClicked }) {
  return (
    <div className="grid-cell">
      <div className={"square " + ("sq" + styleCt)} onClick={onSquareClicked}>
      </div>
    </div>
  );
}

function Board({ isSetup, numberOfRows, numberOfColumns, squares, onPlace, onSelect }) {
  
  function handleClick(row, col) {
    const nextSquares = squares.map((arr, i) => arr.slice().map((e,i2) => Math.abs(e)));
    
    if (isSetup) {
      nextSquares[row][col] = (nextSquares[row][col] + 1) % 3;
      onPlace(nextSquares);
    } else {
      nextSquares[row][col] *= -1;
      onSelect(row, col, nextSquares);
    }
  }

  return (
    <>
      {squares.map((e, i) => {
        return (
          <div key={-i} className="board-row">
            {squares[i].map((e2, i2) => {
              return (
                <Square key={i*numberOfRows+i2} value={squares[i][i2]} styleCt={squares[i][i2]} onSquareClicked={() => handleClick(i, i2)} />
              )
            })}
          </div>
        )
      })}
    </>
  );
}

export default function Game() {
  const [isBackgroundRotatingOn, setIsBackgroundRotatingOn] = useState(true);
  const [numberOfRows, setNumberOfRows] = useState(7);
  const [numberOfColumns, setNumberOfColumns] = useState(7);
  const [isSetup, setIsSetup] = useState(true);
  const [currentSquares, setCurrentSquares] = useState(Array(numberOfRows).fill(Array(numberOfColumns).fill(0)));
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);
  const [hasWon, setHasWon] = useState(false);

  function handleRotateEarthChanged() {
    setIsBackgroundRotatingOn(!isBackgroundRotatingOn);
  }

  function handleSetupModeChanged() {
    const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => Math.abs(e)));
    setCurrentSquares(nextSquares);
    setIsSetup(!isSetup);
  }

  function handlePlace(nextSquares) {
    setCurrentSquares(nextSquares);
  }

  function handleSelect(row, col, nextSquares) {
    setSelectedRow(row);
    setSelectedCol(col);
    setCurrentSquares(nextSquares);
  }

  function handleOnKeyDown(event) {
    const c = String.fromCharCode(event.keyCode);
    if (c === 'R') {
      handleRotateEarthChanged();
    } else if (!hasWon) {
      if (c === 'E') {
        handleSetupModeChanged();
      } else if (!isSetup) {
        const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => e));
        if (c === 'W') {
          if (nextSquares[0][selectedCol] === 0) {
            for (let i = 0; i < numberOfRows - 1; i++) {
              nextSquares[i][selectedCol] = nextSquares[i+1][selectedCol];
            }
            nextSquares[numberOfRows-1][selectedCol] = 0;
            updateIfValid(selectedRow - 1, selectedCol, nextSquares);
          }
        } else if (c === 'D') {
          if (nextSquares[selectedRow][numberOfColumns - 1] === 0) {
            for (let i = numberOfColumns - 1; i > 0; i--) {
              nextSquares[selectedRow][i] = nextSquares[selectedRow][i-1];
            }
            nextSquares[selectedRow][0] = 0;
            updateIfValid(selectedRow, selectedCol + 1, nextSquares);
          }
        } else if (c === 'S') {
          if (nextSquares[numberOfRows - 1][selectedCol] === 0) {
            for (let i = numberOfRows - 1; i > 0; i--) {
              nextSquares[i][selectedCol] = nextSquares[i-1][selectedCol];
            }
            nextSquares[0][selectedCol] = 0;
            updateIfValid(selectedRow + 1, selectedCol, nextSquares);
          }
        } else if (c === 'A') {
          if (nextSquares[selectedRow][0] === 0) {
            for (let i = 0; i < numberOfColumns - 1; i++) {
              nextSquares[selectedRow][i] = nextSquares[selectedRow][i+1];
            }
            nextSquares[selectedRow][numberOfColumns - 1] = 0;
            updateIfValid(selectedRow, selectedCol - 1, nextSquares);
          }
        } else if (event.code == 'ArrowLeft') {
          if (selectedCol > 0 && nextSquares[selectedRow][selectedCol-1] !== 0) {
            nextSquares[selectedRow][selectedCol] *= -1;
            nextSquares[selectedRow][selectedCol-1] *= -1;
            setSelectedCol(selectedCol-1);
            setCurrentSquares(nextSquares);
          }
        } else if (event.code == 'ArrowRight') {
          if (selectedCol < numberOfColumns - 1 && nextSquares[selectedRow][selectedCol+1] !== 0) {
            nextSquares[selectedRow][selectedCol] *= -1;
            nextSquares[selectedRow][selectedCol+1] *= -1;
            setSelectedCol(selectedCol+1);
            setCurrentSquares(nextSquares);
          }
        } else if (event.code == 'ArrowUp') {
          if (selectedRow > 0 && nextSquares[selectedRow-1][selectedCol] !== 0) {
            nextSquares[selectedRow-1][selectedCol] *= -1;
            nextSquares[selectedRow][selectedCol] *= -1;
            setSelectedRow(selectedRow-1);
            setCurrentSquares(nextSquares);
          }
        } else if (event.code == 'ArrowDown') {
          if (selectedCol < numberOfRows - 1 && nextSquares[selectedRow+1][selectedCol] !== 0) {
            nextSquares[selectedRow][selectedCol] *= -1;
            nextSquares[selectedRow+1][selectedCol] *= -1;
            setSelectedRow(selectedRow+1);
            setCurrentSquares(nextSquares);
          }
        }
      }
    }
    if (c === 'N') {
      const nextSquares = Array(numberOfRows).fill(Array(numberOfColumns).fill(0));
      setCurrentSquares(nextSquares);
      setIsSetup(true);
      setHasWon(false);
    }
  }

  function updateIfValid(row, col, nextSquares) {

    // neighbors are only counted if adjacent (no corner neighbors counted)
    // '2' squares disappear if less than 2 neighbors unless it causes a '1' square to have less than two neighbors
    // '1' squares must always have two neighbors
    const neighborCounts = Array.from(Array(numberOfRows), () => Array(numberOfColumns).fill(0));

    let isValid = true;
    let blueCt = 0;

    for (let i = 0; i < numberOfRows; i++) {
      for (let j = 0; j < numberOfColumns; j++) {
        if (nextSquares[i][j] !== 0) {
          let inc = 1;
          if (Math.abs(nextSquares[i][j]) === 2) {
            blueCt++;
            inc = -1;
          }
          if (i - 1 >= 0) {
            if (nextSquares[i-1][j] !== 0) {
              neighborCounts[i][j]+=inc;
            }
          }
          if (i + 1 < numberOfRows) {
            if (nextSquares[i+1][j] !== 0) {
              neighborCounts[i][j]+=inc;
            }
          }
          if (j - 1 >= 0) {
            if (nextSquares[i][j-1] !== 0) {
              neighborCounts[i][j]+=inc;
            }
          }
          if (j + 1 < numberOfColumns) {
            if (nextSquares[i][j+1] !== 0) {
              neighborCounts[i][j]+=inc;
            }
          }
        }
      }
    }

    let same = true;
    do {
      same = true;
      for (let i = 0; i < numberOfRows; i++) {
        for (let j = 0; j < numberOfColumns; j++) {
          if (nextSquares[i][j] !== 0) {
            if (Math.abs(nextSquares[i][j]) === 1) {
              if (neighborCounts[i][j] < 2) {
                isValid = false;
              }
            } else if (Math.abs(nextSquares[i][j]) === 2 && neighborCounts[i][j] >= -1) {
              let canDisappear = true;

              if (i - 1 >= 0 && neighborCounts[i-1][j] === 2) {
                canDisappear = false;
              }
              if (i + 1 < numberOfRows && neighborCounts[i+1][j] === 2) {
                canDisappear = false;
              }
              if (j - 1 >= 0 && neighborCounts[i][j-1] === 2) {
                canDisappear = false;
              }
              if (j + 1 < numberOfColumns && neighborCounts[i][j+1] === 2) {
                canDisappear = false;
              }

              if (canDisappear) {
                nextSquares[i][j] = 0;
                blueCt--;
                neighborCounts[i][j] = 0;
                if (i - 1 >= 0 && neighborCounts[i-1][j] !== 0) {
                  neighborCounts[i-1][j] = Math.sign(neighborCounts[i-1][j])*(Math.abs(neighborCounts[i-1][j]) - 1);
                }
                if (i + 1 < numberOfRows && neighborCounts[i+1][j] !== 0) {
                  neighborCounts[i+1][j] = Math.sign(neighborCounts[i+1][j])*(Math.abs(neighborCounts[i+1][j]) - 1);
                }
                if (j - 1 >= 0 && neighborCounts[i][j-1] !== 0) {
                  neighborCounts[i][j-1] = Math.sign(neighborCounts[i][j-1])*(Math.abs(neighborCounts[i][j-1]) - 1);
                }
                if (j + 1 < numberOfColumns && neighborCounts[i][j+1] !== 0) {
                  neighborCounts[i][j+1] = Math.sign(neighborCounts[i][j+1])*(Math.abs(neighborCounts[i][j+1]) - 1);
                }
                same = false;
              }
            }
          }
        }
      }
    } while(!same);

    if (isValid) {

      if (blueCt === 0) {
        setHasWon(true);
        for (let i = 0; i < numberOfRows; i++) {
          for (let j = 0; j < numberOfColumns; j++) {
            if (nextSquares[i][j] === 0) {
              nextSquares[i][j] = 3;
            } else {
              nextSquares[i][j] = 4;
            }
          }
        }
      }

      setSelectedRow(row);
      setSelectedCol(col);
      setCurrentSquares(nextSquares);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo"><span className = "engraved app-title">XLEAR</span></div>
        <div className="App-settings"><label className="engraved app-setting-label">Setup Mode:</label><input className="app-setting-checkbox" type="checkbox" onChange={handleSetupModeChanged} checked={isSetup}></input></div>
        <div className="App-settings"><label className="engraved app-setting-label">Rotate Earth:</label><input className="app-setting-checkbox" type="checkbox" onChange={handleRotateEarthChanged} checked={isBackgroundRotatingOn}></input></div>
      </header>
      <div className="game" tabIndex="0" onKeyDown={handleOnKeyDown}>
        <div className={"game-border" + (isBackgroundRotatingOn ? " rotating" : "")}>
          
        </div>
        <div className={"dirt-border" + (isBackgroundRotatingOn ? " rotating" : "")}>
          
        </div>
        <div className="game-board">
            <Board isSetup={isSetup} numberOfRows={numberOfRows} numberOfColumns={numberOfColumns} squares={currentSquares} onPlace={handlePlace} onSelect={handleSelect} />
          </div>
      </div>
      <footer className="App-footer">
        <div className={"App-settings" + (hasWon ? "" : "-hidden")}><label className="engraved app-setting-label">You Won!</label></div>
        <div className={"App-settings" + (hasWon ? "" : "-hidden")}><label className="engraved app-setting-label">Press (N) to Play Again!</label></div>
      </footer>
    </div>
  );
}
