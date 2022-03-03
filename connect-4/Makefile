CXX=g++
CXXFLAGS=--std=c++11 -W -Wall -O3 -DNDEBUG

SRCS=Solver.cpp
OBJS=$(subst .cpp,.o,$(SRCS))

c4solver.exe : $(OBJS) main.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ -o $< $(LDLIBS)

generator.exe : generator.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) -o $< generator.o $(LDLIBS)

.depend : $(SRCS)
	$(CXX) $(CXXFLAGS) -MM $^ > ./.depend
	
-include .depend

clean :
	rm -f *.o .depend c4solver generator
