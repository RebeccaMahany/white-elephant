package main

import (
	"math/rand"
	"time"
)

type gamePhase int

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const gameCodeLength = 4

const (
	setup gamePhase = iota
	playing
	ended
)

type game struct {
	Code          string
	IsPaused      bool
	StartTime     int64
	Phase         gamePhase
	CurrentPlayer *player
}

func newGame() game {
	newGameCode := generateNewGameCode()
	now := time.Now()
	newGame := game{
		Code:      newGameCode,
		IsPaused:  false,
		StartTime: now.Unix(),
		Phase:     setup,
	}

	// TODO save

	return newGame
}

func generateNewGameCode() string {
	// TODO confirm that this isn't already taken
	b := make([]byte, gameCodeLength)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
