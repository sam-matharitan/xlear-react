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
      onPlace(row, col, nextSquares);
    } else {
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
  const [isSetup, setIsSetup] = useState(false);
  const [isPlayEnabled, setIsPlayEnabled] = useState(true);
  const [currentSquares, setCurrentSquares] = useState([[0,0,0,0,0,0,0]
                                                       ,[0,0,0,0,0,0,0]
                                                       ,[0,0,2,1,2,0,0]
                                                       ,[0,0,1,-2,1,0,0]
                                                       ,[0,0,2,1,2,0,0]
                                                       ,[0,0,0,0,0,0,0]
                                                       ,[0,0,0,0,0,0,0]]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);
  const [hasWon, setHasWon] = useState(false);
  const [rotateLabel, setRotateLabel] = useState("Stop Rotating Land");
  const [playLabel, setPlayLabel] = useState("Edit");
  const [storedSquares, setStoredSquares] = useState(null);
  const [rulesShowing, setRulesShowing] = useState(false);

  function handleRotateEarthChanged() {
    if (!isBackgroundRotatingOn) {
      setRotateLabel("Stop Rotating Land");
    } else {
      setRotateLabel("Rotate Land");
    }
    setIsBackgroundRotatingOn(!isBackgroundRotatingOn);
  }

  function handleSetupModeChanged() {
    const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => Math.abs(e)));
    if (!isSetup) {
      setPlayLabel("Play");
      setSelectedRow(null);
      setSelectedCol(null);
      setCurrentSquares(nextSquares);
      setIsSetup(true);
    } else if (isPlayEnabled && updateIfValid(selectedRow, selectedCol, nextSquares, true)) {
      setPlayLabel("Edit");
      setCurrentSquares(nextSquares);
      setIsSetup(false);
    } else {
      setIsSetup(true);
      setIsPlayEnabled(false);
    }
  }

  function handlePlace(row, col, nextSquares) {
    nextSquares[row][col] = (nextSquares[row][col] + 1) % 3;
    setCurrentSquares(nextSquares);

    if (updateIfValid(selectedRow, selectedCol, nextSquares, true, true)) {
      setIsPlayEnabled(true);
    } else {
      setIsPlayEnabled(false);
    }
  }

  function handleSelect(row, col, nextSquares) {
    if (!hasWon) {
      nextSquares[row][col] *= -1;
      setSelectedRow(row);
      setSelectedCol(col);
      setCurrentSquares(nextSquares);
    }
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
      setIsPlayEnabled(false);
      setPlayLabel("Play");
      setIsSetup(true);
      setHasWon(false);
    }
  }

  function handleResetClick() {
    const nextSquares = Array(numberOfRows).fill(Array(numberOfColumns).fill(0));
    setCurrentSquares(nextSquares);
    setIsPlayEnabled(false);
    setPlayLabel("Play");
    setIsSetup(true);
    setHasWon(false);
  }

  function handleRulesClick() {
    setRulesShowing(!rulesShowing);
  }

  function handleStoreClick() {
    const temp = currentSquares.map((arr, i) => arr.slice().map((e,i2) => e));
    setStoredSquares(temp);
  }

  function handleRecallClick() {
    if (storedSquares) {
      const temp = storedSquares.map((arr, i) => arr.slice().map((e,i2) => isSetup ? Math.abs(e) : e));
      setCurrentSquares(temp);
      setSelectedRow(selectedRow);
      setSelectedCol(selectedCol);
      if (hasWon) {
        setHasWon(!hasWon);
      }
      if (isSetup) {
        if (updateIfValid(selectedRow, selectedCol, temp, true, true)) {
          setIsPlayEnabled(true);
        } else {
          setIsPlayEnabled(false);
        }
      } else if (!updateIfValid(selectedRow, selectedCol, temp, true, true)) {
        setIsPlayEnabled(false);
        setIsSetup(true);
      }
    }
  }

  function handleClearClick() {
    setStoredSquares(null);
  }

  function handleControlDownClick() {
    if (!hasWon && !isSetup) {
      const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => e));
      if (nextSquares[numberOfRows - 1][selectedCol] === 0) {
        for (let i = numberOfRows - 1; i > 0; i--) {
          nextSquares[i][selectedCol] = nextSquares[i-1][selectedCol];
        }
        nextSquares[0][selectedCol] = 0;
        updateIfValid(selectedRow + 1, selectedCol, nextSquares);
      }
    }
  }

  function handleControlUpClick() {
    if (!hasWon && !isSetup) {
      const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => e));
      if (nextSquares[0][selectedCol] === 0) {
        for (let i = 0; i < numberOfRows - 1; i++) {
          nextSquares[i][selectedCol] = nextSquares[i+1][selectedCol];
        }
        nextSquares[numberOfRows-1][selectedCol] = 0;
        updateIfValid(selectedRow - 1, selectedCol, nextSquares);
      }
    }
  }

  function handleControlLeftClick() {
    if (!hasWon && !isSetup) {
      const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => e));
      if (nextSquares[selectedRow][0] === 0) {
        for (let i = 0; i < numberOfColumns - 1; i++) {
          nextSquares[selectedRow][i] = nextSquares[selectedRow][i+1];
        }
        nextSquares[selectedRow][numberOfColumns - 1] = 0;
        updateIfValid(selectedRow, selectedCol - 1, nextSquares);
      }
    }
  }

  function handleControlRightClick() {
    if (!hasWon && !isSetup) {
      const nextSquares = currentSquares.map((arr, i) => arr.slice().map((e,i2) => e));
      if (nextSquares[selectedRow][numberOfColumns - 1] === 0) {
        for (let i = numberOfColumns - 1; i > 0; i--) {
          nextSquares[selectedRow][i] = nextSquares[selectedRow][i-1];
        }
        nextSquares[selectedRow][0] = 0;
        updateIfValid(selectedRow, selectedCol + 1, nextSquares);
      }
    }
  }

  function updateIfValid(row, col, nextSquares, checkStart, isPlacement) {

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

    if (!isPlacement) {
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
    } else {
      let anyThere = false;
      for (let i = 0; i < numberOfRows; i++) {
        for (let j = 0; j < numberOfColumns; j++) {
          if (Math.abs(nextSquares[i][j]) === 1) {
            anyThere = true;
            if (neighborCounts[i][j] < 2) {
              isValid = false;
            }
          }
        }
      }
      if (!anyThere) {
        isValid = false;
      }
    }

    if (isValid) {
      if (!isPlacement) {
        if (blueCt === 0) {
          setHasWon(true);
          setIsPlayEnabled(false);
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

        if (!checkStart) {
          setSelectedRow(row);
          setSelectedCol(col);
          setCurrentSquares(nextSquares);
        }
      }

      return true;
    }

    return false;
  }

  return (
    <>
      <div className="App" onKeyDown={handleOnKeyDown}>
        <div className="App-inner">
          <div className="App-content">
            <div className={"App-header-rules" + (rulesShowing ? "" : "-hidden")}>
              <div className={"closeRules" + (rulesShowing ? "" : "-hidden")} onClick={handleRulesClick}>×</div>
              <div className="toast-rules">
                <div className="rules">
                  <span className = "engraved app-setting-title">The Rules</span>
                  <span className = "app-setting-subtitle">Storm Clouds (Saturation)</span>
                  <div className="App-settings-buttons">
                    <div className="sq1-rules"></div>
                  </div>
                  <span className="app-setting-desc">Storm Clouds must have at least 2 adjacent neighbors at all times, composed of Storm Clouds and/or Rain.</span>
                  <span className = "app-setting-subtitle">Rain (Precipitation)</span>
                  <div className="App-settings-buttons">
                    <div className="sq2-rules"></div>
                  </div>
                  <span className="app-setting-desc">Rain falls (disappears) if it has less than 2 adjacent neighbors, unless disappearing would invalidate the Saturation rule.</span>
                  <span className = "engraved app-setting-title">How to Edit</span>
                  <span className = "app-setting-subtitle">Order of Placement</span>
                  <div className="App-settings-buttons">
                    <div className="sq0-rules"></div>
                    <div className="sq1-rules"></div>
                    <div className="sq2-rules"></div>
                    <div className="sq0-rules"></div>
                  </div>
                  <span className="app-setting-desc">During Edit mode, selecting one of the above types of items in the 'Order of Placement' arrangement will turn it into the item to the right of it in the order.</span>
                  <span className = "engraved app-setting-title">How to Move</span>
                  <div className="App-settings-buttons">
                    <div className="sq-1-rules"></div>
                    <div className="sq-2-rules"></div>
                  </div>
                  <span className="app-setting-desc">During Play mode, selecting a Storm Cloud or a Rain will highlight it as above, signifying it being selected.</span>
                  <div className="App-settings-buttons">
                    <div className="control-up-rules"></div>
                    <div className="control-right-rules"></div>
                    <div className="control-down-rules"></div>
                    <div className="control-left-rules"></div>
                  </div>
                  <span className="app-setting-desc">Once selected, pressing one of the above Wind Gusts will move an entire row or column in the direction towards the selected Wind Gust, unless a Storm Cloud or a Rain would be moved off the grid.</span>
                  <span className = "engraved app-setting-title">How to Win</span>
                  <div className="App-settings-buttons">
                    <div className="sq4-rules"></div>
                  </div>
                  <span className="app-setting-desc">The game is won if all the Rain falls (disappears). Upon winning, the Storm Clouds turn into the Wind (above).</span>
                  <div className="App-settings-buttons"></div>
                  <div className="App-settings-buttons"></div>
                </div>
              </div>
            </div>
            <header className={"App-header" + (rulesShowing ? " blur" : "")}>
              <div className="App-logo"><span className = "engraved app-title">XLEAR</span></div>
            </header>
            <div className={"game" + (rulesShowing ? " blur" : "")} tabIndex="0">
              <div className="ocean-border">

              </div>
              <div className={"game-border" + (isBackgroundRotatingOn ? " rotating" : "")}>
                
              </div>
              <div className={"dirt-border" + (isBackgroundRotatingOn ? " rotating" : "")}>
                
              </div>
              <div className="controls">
                <div className="control-up" onClick={handleControlUpClick}/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer-middle">
                  <div className="control-left" onClick={handleControlLeftClick}/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-spacer-row"/>
                  <div className="control-right" onClick={handleControlRightClick}/>
                </div>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-spacer"/>
                <div className="control-down" onClick={handleControlDownClick}/>
              </div>
              <div className="game-board">
                <Board isSetup={isSetup} numberOfRows={numberOfRows} numberOfColumns={numberOfColumns} squares={currentSquares} onPlace={handlePlace} onSelect={handleSelect} />
              </div>
            </div>
            <div className={"App-footer" + (rulesShowing ? " blur" : "")}>
              <div className="App-settings-buttons">
                <div className="App-setting"><div className={"App-setting-button-play" + (isPlayEnabled ? "" : "-disabled")} onClick={handleSetupModeChanged}><label className="App-setting-button-label app-setting-label">{playLabel}</label></div></div>
                <div className="App-setting"><div className="App-setting-button" onClick={handleResetClick}><label className="App-setting-button-label app-setting-label">Empty</label></div></div>
                <div className="App-setting"><div className="App-setting-button-rules" onClick={handleRulesClick}><label className="App-setting-button-label app-setting-label">Rules</label></div></div>
              </div>
              <div className="App-settings-buttons">
                <div className="App-setting"><div className="App-setting-button-store" onClick={handleStoreClick}><label className="App-setting-button-label app-setting-label">Store</label></div></div>
                <div className="App-setting"><div className="App-setting-button-recall" onClick={handleRecallClick}><label className="App-setting-button-label app-setting-label">Recall</label></div></div>
                <div className="App-setting"><div className="App-setting-button-clear" onClick={handleClearClick}><label className="App-setting-button-label app-setting-label">Clear</label></div></div>
              </div>
              <div className="App-settings-buttons">
                <div className="App-setting"><div className="App-setting-button-rotate" onClick={handleRotateEarthChanged}><label className="App-setting-button-label app-setting-label">{rotateLabel}</label></div></div>
              </div>
            </div>
            <footer className="App-footer-copyright">
              <div className="App-settings-buttons">
                <div className="App-setting"><label className="App-setting-label-copyright">© 2024, The Matharitan Group, LLC</label></div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
