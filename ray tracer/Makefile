
CC = g++ 
CFLAGS = -g -c -Wall -pedantic -Wextra -Wno-unused-parameter
LDFLAGS = -std=c++11
# LDFLAGS =

BIN = raytrace
SRC = main.cpp \
      parser.cpp \
      raytracer.cpp \
      object.cpp

OBJ = main.o parser.o raytracer.o object.o

$(BIN): $(OBJ)
	$(CC) $(OBJ) -o $(BIN)

%.o: $(SRC)
	$(CC) $(LDFLAGS) $(CFLAGS) $(SRC)

clean:
	rm *.o raytrace

test: $(BIN)
	./$(BIN) scenes/basic.ray