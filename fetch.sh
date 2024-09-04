#!/bin/bash

# Infinite loop to keep restarting the command if it crashes
while true; do
	  # Execute the command and wait for it to finish
	    npx ts-node src/main.ts

	      # Check the exit status of the command
	        EXIT_STATUS=$?

		  # If the exit status is not 0 (which means the command failed), restart it
		    if [ $EXIT_STATUS -ne 0 ]; then
			        echo "Command crashed with exit status $EXIT_STATUS. Restarting..."
				  else
					      # If the command exits successfully, break the loop (optional)
					          echo "Command exited successfully."
						      break
						        fi
						done
