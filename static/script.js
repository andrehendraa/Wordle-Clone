let currentRow = 0;
let currentCol = 0;
const maxCols = 5; // Maksimum kolom di setiap baris
const maxRows = 6; // Total percobaan (6 baris)

// Ambil semua letter box berdasarkan baris
const rows = document.querySelectorAll(".letter-row");

// Ambil semua tombol pada keyboard
const keys = document.querySelectorAll(".keyboard-button");

// Fungsi untuk memasukkan huruf ke dalam kotak
function insertLetter(letter) {
    if (currentCol < maxCols && currentRow < maxRows) {
        const letterBox = rows[currentRow].children[currentCol];
        letterBox.textContent = letter.toUpperCase();
        letterBox.classList.add("filled-letter");
        currentCol++;
    }
}

// Fungsi untuk menghapus huruf (untuk tombol "Del")
function deleteLetter() {
    if (currentCol > 0 && currentRow < maxRows) {
        currentCol--;
        const letterBox = rows[currentRow].children[currentCol];
        letterBox.textContent = "";
        letterBox.classList.remove("filled-letter");
    }
}

// Fungsi untuk mengirim jawaban (untuk tombol "Enter")
function submitWord() {
    if (currentCol === maxCols) {
        const guess = getWord();
        const payload = { guess: guess };
        console.log("Submitting guess:", payload); // Debugging

        fetch('/check_word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Unknown error');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data); // Debugging
            if (data.error) {
                toastr.error(data.error);
                return;
            }

            const result = data.result; // Array hasil validasi
            const rowTiles = rows[currentRow].children;

            for (let i = 0; i < maxCols; i++) {
                const letterBox = rowTiles[i];
                const letter = letterBox.textContent;
                letterBox.classList.remove("filled-letter");

                if (result[i] === 'correct') {
                    letterBox.classList.add("correct-letter");
                    updateKeyboard(letter, 'correct');
                } else if (result[i] === 'present') {
                    letterBox.classList.add("present-letter");
                    updateKeyboard(letter, 'present');
                } else {
                    letterBox.classList.add("absent-letter");
                    updateKeyboard(letter, 'absent');
                }
            }

            // Cek kondisi menang atau lanjut ke baris berikutnya
            if (result.every(status => status === 'correct')) {
                toastr.success("Congratulations! You've guessed the word!");
                disableInput();
            } else if (currentRow < maxRows - 1) {
                currentRow++;
                currentCol = 0;
            } else {
                toastr.error("Game Over! The word was: " + data.secret_word);
                disableInput();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toastr.error("An error occurred while checking the word.");
        });
    } else {
        toastr.error("Word must be 5 letters long!");
    }
}

// Fungsi untuk mengambil kata yang telah diisi
function getWord() {
    let word = "";
    for (let i = 0; i < maxCols; i++) {
        word += rows[currentRow].children[i].textContent;
    }
    return word;
}

// Fungsi untuk menonaktifkan input setelah game selesai
function disableInput() {
    keys.forEach(key => {
        key.disabled = true;
    });
}

// Fungsi untuk memperbarui keyboard berdasarkan status huruf
function updateKeyboard(letter, status) {
    const keyButtons = Array.from(keys).filter(key => key.textContent.toUpperCase() === letter);
    keyButtons.forEach(key => {
        if (status === 'correct') {
            key.classList.remove('present-letter', 'absent-letter');
            key.classList.add('correct-letter');
        } else if (status === 'present') {
            if (!key.classList.contains('correct-letter')) {
                key.classList.remove('absent-letter');
                key.classList.add('present-letter');
            }
        } else if (status === 'absent') {
            if (!key.classList.contains('correct-letter') && !key.classList.contains('present-letter')) {
                key.classList.add('absent-letter');
            }
        }
    });
}

function resetGame() {
    // Fetch a new secret word from the server
    fetch('/new_word')
        .then(response => response.json())
        .then(data => {
            console.log("New secret word received:", data.secret_word); // Debugging

            // Clear all letter boxes
            rows.forEach(row => {
                Array.from(row.children).forEach(letterBox => {
                    letterBox.textContent = "";
                    letterBox.classList.remove("filled-letter", "correct-letter", "present-letter", "absent-letter");
                });
            });

            // Reset game state variables
            currentRow = 0;
            currentCol = 0;

            // Re-enable keyboard input
            keys.forEach(key => {
                key.disabled = false;
                key.classList.remove('correct-letter', 'present-letter', 'absent-letter');
            });

            toastr.success("Game reset");
        })
        .catch(error => {
            console.error('Error fetching new secret word:', error);
            toastr.error("Failed to reset the game. Please try again.");
        });
}

// Reload button click event
document.getElementById('reload-img').addEventListener('click', function() {
    resetGame();
});


//Tombol keyboard input
keys.forEach(key => {
    key.addEventListener('click', () => {
        const keyValue = key.textContent.toUpperCase();

        if (keyValue === "DEL") {
            deleteLetter();
        } else if (keyValue === "ENTER") {
            submitWord();
        } else if (/^[A-Z]$/.test(keyValue)) {
            insertLetter(keyValue);
        }
    });
});

// Keyboard fisik input
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();

    if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (key === 'ENTER') {
        submitWord();
    } else if (/^[A-Z]$/.test(key)) {
        insertLetter(key);
    }
});

document.addEventListener('click', function() {
    const audio = document.getElementById('background-audio');
    if (audio.paused) {
        audio.play();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const h1 = document.getElementById('animated-text');
    h1.style.animation = 'none';  // Reset animation
    setTimeout(() => {
      h1.style.animation = '';  // Reapply the animation
    }, 10);  // Small delay to ensure animation re-triggers
  });


