CXX=g++
CXXFLAGS=--std=c++11 -W -Wall -O3 -DNDEBUG

SRCS=main.cpp Solver.cpp
OBJS=$(SRCS:.cpp=.o)

c4solver : $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^

generator : generator.o
	$(CXX) $(CXXFLAGS) -o $@ $^

generator.o: generator.cpp
	$(CXX) $(CXXFLAGS) -c $^

.depend : Solver.cpp
	$(CXX) $(CXXFLAGS) -MM $^ > ./.depend
	
-include .depend

clean:
	rm -f *.o .depend c4solver generator