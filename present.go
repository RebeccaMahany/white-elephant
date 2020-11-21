package main

type present struct {
	ID           int
	Name         string
	Description  string
	Gifter       player
	CurrentOwner player
	Game         game
}
